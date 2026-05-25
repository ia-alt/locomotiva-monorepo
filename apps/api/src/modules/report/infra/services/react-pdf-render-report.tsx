import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { RenderReportService } from "@report/domain/services/render-report";
import { MonthReport } from "@report/domain/value-objects/month-report";

const chartCanvas = new ChartJSNodeCanvas({ width: 500, height: 220, backgroundColour: "white" });

async function buildLineChart(labels: string[], values: number[]): Promise<string> {
    const buffer = await chartCanvas.renderToBuffer({
        type: "line",
        data: {
            labels,
            datasets: [{ data: values, borderColor: "#1565C0", backgroundColor: "transparent", pointRadius: 0, tension: 0.3 }],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { grid: { color: "#f5f5f5" }, ticks: { font: { size: 11 }, maxTicksLimit: 4 } },
            },
        },
    });
    return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function buildBarChart(labels: string[], values: number[]): Promise<string> {
    const max = Math.max(...values, 0);
    const colors = values.map((v) => (v === max && max > 0 ? "#1565C0" : "#90CAF9"));
    const buffer = await chartCanvas.renderToBuffer({
        type: "bar",
        data: {
            labels,
            datasets: [{ data: values, backgroundColor: colors }],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { grid: { color: "#f5f5f5" }, ticks: { font: { size: 11 }, maxTicksLimit: 4 } },
            },
        },
    });
    return `data:image/png;base64,${buffer.toString("base64")}`;
}

const DAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const s = StyleSheet.create({
    page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#222" },

    // Header
    header: { marginBottom: 24 },
    title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    subtitle: { fontSize: 10, color: "#666" },

    // KPI cards (3 cards lado a lado)
    kpiRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    kpiCard: { flex: 1, border: "1 solid #e0e0e0", borderRadius: 6, padding: 14 },
    kpiTitle: { fontSize: 8, color: "#666", marginBottom: 2 },
    kpiValue: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#1565C0", marginBottom: 1 },
    kpiSubtitle: { fontSize: 8, color: "#444" },

    // Seção de gráficos (substituída por tabelas de dados)
    chartsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    chartCard: { flex: 1, border: "1 solid #e0e0e0", borderRadius: 6, padding: 14 },
    chartTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    chartCaption: { fontSize: 8, color: "#666", marginBottom: 8 },
    dataRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
    dataLabel: { color: "#555" },
    dataValue: { fontFamily: "Helvetica-Bold", color: "#1565C0" },

    // Tabelas
    tableSection: { marginBottom: 20 },
    tableSectionHeader: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e0e0e0", marginBottom: 0 },
    tableSectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
    tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", paddingHorizontal: 12, paddingVertical: 5 },
    tableRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
    tableGroupRow: { backgroundColor: "#f5f5f5", paddingHorizontal: 12, paddingVertical: 4 },
    tableGroupLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#666" },
    headerCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#666" },
    cell: { fontSize: 9 },
    cellSub: { fontSize: 8, color: "#888", marginTop: 1 },
    empty: { color: "#aaa", fontSize: 9, padding: 24, textAlign: "center" },

    // Colunas agendamentos
    colDate: { width: 68 },
    colEvent: { flex: 2 },
    colResponsible: { flex: 2 },
    colCompany: { flex: 2 },
    colRoom: { flex: 1 },
    colPeople: { width: 48, textAlign: "right" },

    // Colunas coworking
    colEmpty: { width: 12 },
    colMember: { flex: 3 },
    colMemberCompany: { flex: 3 },
    colTime: { width: 40 },
    colDuration: { width: 50, textAlign: "right" },
});

function fmtTime(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][d.getMonth()];
    return `${day} ${month}. ${d.getFullYear()}`;
}

const MonthReportDocument = ({ report, lineChartImg, barChartImg }: { report: MonthReport; lineChartImg: string; barChartImg: string }) => {
    const json = report.toJSON();

    const groups = json.coworkingLogs.reduce<Record<string, typeof json.coworkingLogs>>((acc, item) => {
        const key = fmtDate(item.accessLog.entryTime);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* Header */}
                <View style={s.header}>
                    <Text style={s.title}>Relatório</Text>
                    <Text style={s.subtitle}>Mês {String(json.month).padStart(2,"0")}/{json.year}</Text>
                </View>

                {/* KPI Cards — igual à tela: Coworking | Reservas de Salas | Total */}
                <View style={s.kpiRow}>
                    <View style={s.kpiCard}>
                        <Text style={s.kpiValue}>{json.totalPeopleCoworking}</Text>
                        <Text style={s.kpiTitle}>atendimentos no</Text>
                        <Text style={s.kpiSubtitle}>Coworking</Text>
                    </View>
                    <View style={s.kpiCard}>
                        <Text style={s.kpiValue}>{json.totalPeopleBooking}</Text>
                        <Text style={s.kpiTitle}>atendimentos em</Text>
                        <Text style={s.kpiSubtitle}>{json.totalBookings} Reservas de Salas</Text>
                    </View>
                    <View style={s.kpiCard}>
                        <Text style={s.kpiValue}>{json.totalPeople}</Text>
                        <Text style={s.kpiTitle}>atendimentos no</Text>
                        <Text style={s.kpiSubtitle}>Total</Text>
                    </View>
                </View>

                {/* Gráficos */}
                <View style={s.chartsRow}>
                    <View style={s.chartCard}>
                        <Text style={s.chartTitle}>Evolução — Mês Atual</Text>
                        <Text style={s.chartCaption}>Total de pessoas por dia (coworking + agendamentos)</Text>
                        <Image src={lineChartImg} />
                    </View>
                    <View style={s.chartCard}>
                        <Text style={s.chartTitle}>Dias Mais Movimentados</Text>
                        <Text style={s.chartCaption}>Total de pessoas por dia da semana no mês</Text>
                        <Image src={barChartImg} />
                    </View>
                </View>

                {/* Tabela de Agendamentos */}
                <View style={s.tableSection}>
                    <View style={s.tableSectionHeader}>
                        <Text style={s.tableSectionTitle}>Agendamentos</Text>
                    </View>
                    <View style={s.tableHeader}>
                        <Text style={[s.colDate, s.headerCell]}>DATA</Text>
                        <Text style={[s.colEvent, s.headerCell]}>NOME DO EVENTO</Text>
                        <Text style={[s.colResponsible, s.headerCell]}>RESPONSÁVEL</Text>
                        <Text style={[s.colCompany, s.headerCell]}>EMPRESA / INSTITUIÇÃO</Text>
                        <Text style={[s.colRoom, s.headerCell]}>SALA</Text>
                        <Text style={[s.colPeople, s.headerCell]}>PESSOAS</Text>
                    </View>
                    {json.bookings.length === 0 ? (
                        <Text style={s.empty}>Nenhum agendamento neste mês.</Text>
                    ) : (
                        json.bookings.map((item, i) => (
                            <View key={i} style={s.tableRow}>
                                <Text style={[s.colDate, s.cell]}>{fmtDate(item.booking.period.from)}</Text>
                                <Text style={[s.colEvent, s.cell]}>{item.booking.title}</Text>
                                <View style={s.colResponsible}>
                                    <Text style={s.cell}>{item.user.name}</Text>
                                    <Text style={s.cellSub}>{item.user.email}</Text>
                                </View>
                                <View style={s.colCompany}>
                                    <Text style={s.cell}>{item.user.company ?? "—"}</Text>
                                    {item.user.jobTitle ? <Text style={s.cellSub}>{item.user.jobTitle}</Text> : null}
                                </View>
                                <Text style={[s.colRoom, s.cell]}>{(item as any).room?.name ?? "—"}</Text>
                                <Text style={[s.colPeople, s.cell]}>{item.booking.numberOfPeople ?? "—"}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Tabela de Coworking — agrupada por data igual à tela */}
                <View style={s.tableSection}>
                    <View style={s.tableSectionHeader}>
                        <Text style={s.tableSectionTitle}>Coworking</Text>
                    </View>
                    <View style={s.tableHeader}>
                        <Text style={[s.colEmpty, s.headerCell]}> </Text>
                        <Text style={[s.colMember, s.headerCell]}>MEMBRO</Text>
                        <Text style={[s.colMemberCompany, s.headerCell]}>EMPRESA / INSTITUIÇÃO</Text>
                        <Text style={[s.colTime, s.headerCell]}>ENTRADA</Text>
                        <Text style={[s.colTime, s.headerCell]}>SAÍDA</Text>
                        <Text style={[s.colDuration, s.headerCell]}>DURAÇÃO</Text>
                    </View>
                    {json.coworkingLogs.length === 0 ? (
                        <Text style={s.empty}>Nenhum acesso ao coworking neste mês.</Text>
                    ) : (
                        Object.entries(groups).map(([dateLabel, items]) => (
                            <React.Fragment key={dateLabel}>
                                <View style={s.tableGroupRow}>
                                    <Text style={s.tableGroupLabel}>{dateLabel.toUpperCase()}</Text>
                                </View>
                                {items.map((item, i) => (
                                    <View key={i} style={s.tableRow}>
                                        <Text style={s.colEmpty}> </Text>
                                        <View style={s.colMember}>
                                            <Text style={s.cell}>{item.user.name}</Text>
                                            <Text style={s.cellSub}>{item.user.email}</Text>
                                        </View>
                                        <View style={s.colMemberCompany}>
                                            <Text style={s.cell}>{item.user.company ?? "—"}</Text>
                                            {item.user.jobTitle ? <Text style={s.cellSub}>{item.user.jobTitle}</Text> : null}
                                        </View>
                                        <Text style={[s.colTime, s.cell]}>{fmtTime(item.accessLog.entryTime)}</Text>
                                        <Text style={[s.colTime, s.cell]}>{item.accessLog.exitTime ? fmtTime(item.accessLog.exitTime) : "—"}</Text>
                                        <Text style={[s.colDuration, s.cell]}>{item.durationMinutes != null ? `${item.durationMinutes} min` : "—"}</Text>
                                    </View>
                                ))}
                            </React.Fragment>
                        ))
                    )}
                </View>

            </Page>
        </Document>
    );
};

export class ReactPdfRenderReportService implements RenderReportService {
    async renderMonthReport(report: MonthReport): Promise<Blob> {
        const json = report.toJSON();

        const lineLabels = json.totalPeoplePerDay.map((d) => String(d.day));
        const lineValues = json.totalPeoplePerDay.map((d) => d.coworking + d.booking);

        const barLabels = json.totalPeopleByWeekDay.map((w) => DAY_PT[w.weekday] ?? String(w.weekday));
        const barValues = json.totalPeopleByWeekDay.map((w) => w.total);

        const [lineChartImg, barChartImg] = await Promise.all([
            buildLineChart(lineLabels, lineValues),
            buildBarChart(barLabels, barValues),
        ]);

        const pdfBuffer = await renderToBuffer(<MonthReportDocument report={report} lineChartImg={lineChartImg} barChartImg={barChartImg} />);
        return new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
    }
}
