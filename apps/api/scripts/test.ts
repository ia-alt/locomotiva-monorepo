import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const files = args.filter(arg => arg !== '--watch');

if (files.length === 0) {
    files.push('tests/**/*.test.ts', 'src/**/*.test.ts');
}

const nodeArgs = ['--import=tsx', '--test'];
if (isWatch) {
    nodeArgs.push('--watch');
}
nodeArgs.push(...files);

const child = spawn('node', nodeArgs, { stdio: 'inherit', shell: false });
child.on('exit', code => process.exit(code ?? 0));
