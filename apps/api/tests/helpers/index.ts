import { User } from "../../src/modules/identity/domain/entities"
import { prisma } from "../../src/modules/_core/infra/database/prisma/prisma-instance";
import bcrypt from "bcrypt";

export const UserType = User.UserType;

export async function cleanDatabase() {
    await prisma.coworkingSettings.deleteMany();
    await prisma.spaceOperatingHours.deleteMany();
    await prisma.accessLog.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
}

export async function createTestUser(type: User.UserType) {
    const typeMap = {
        [User.UserType.ADMIN]: "admin",
        [User.UserType.SYSTEM]: "system",
        [User.UserType.USER]: "user",
    }
    const email = `ia+teste-${typeMap[type]}-${Date.now()}@secti2.ma.gov.br`
    const password = "Abc123456789@"
    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            email,
            passwordHash,
            cpf: gerarCpf(),
            birthDate: "1990-01-01T00:00:00.000Z",
            name: "John Doe",
            lastPasswordResetDate: new Date(),
            userType: type,
            id: crypto.randomUUID()
        },
    })

    return { email, password }

}

function gerarCpf() {
    const num1 = aleatorio(); //aleatorio já devolve string, logo não precisa de toString
    const num2 = aleatorio();
    const num3 = aleatorio();

    const dig1 = dig(num1, num2, num3); //agora só uma função dig
    const dig2 = dig(num1, num2, num3, dig1.toString()); //mesma função dig aqui

    //aqui com interpolação de strings fica bem mais legivel
    return `${num1}.${num2}.${num3}-${dig1}${dig2}`;
}

//o quarto parametro(n4) só será recebido para o segundo digito
function dig(n1: string, n2: string, n3: string, n4?: string) {

    //as concatenações todas juntas uma vez que são curtas e legíveis
    const nums = n1.split("").concat(n2.split(""), n3.split(""));

    if (n4 !== undefined) { //se for o segundo digito coloca o n4 no sitio certo
        nums[9] = n4;
    }

    let x = 0;

    //o j é também iniciado e incrementado no for para aproveitar a própria sintaxe dele
    //o i tem inicios diferentes consoante é 1º ou 2º digito verificador
    for (let i = (n4 !== undefined ? 11 : 10), j = 0; i >= 2; i--, j++) {
        x += parseInt(nums[j]) * i;
    }

    const y = x % 11;
    //ternário aqui pois ambos os retornos são simples e continua legivel
    return y < 2 ? 0 : 11 - y;
}

function aleatorio() {
    const aleat = Math.floor(Math.random() * 999);
    //o preenchimento dos zeros à esquerda é mais facil com a função padStart da string
    return ("" + aleat).padStart(3, '0');
}