#! /usr/bin/env node

const config = require('./config')

const path = require('path');
const { readFile, writeFile } = require('fs').promises;
const program = require('commander');
const Table = require("terminal-table");
const t = new Table();
const chalk = require('chalk');
const log = function () {
  console.log()
  console.log(...arguments)
  console.log()
}

program
  .option('ls, --list', 'output registry config')
  .option('add, --add <alias> <url>', 'add registry config')
  .option('remove, --remove <alias> ', 'remove registry')
  .option('use, --use <alias>', 'set registry')

const args = program.parse(process.argv);

t.push([
  ' 别名 ',
  '  镜像源地址 '
])

if (program.list) {
  console.log()
  for (let key in config) {
    t.push(
      [` ${key} `, ` ${config[key]} `],
    );
  }
  console.log('' + t)
  console.log()
}

if (program.add) {
  const [, , , key, url] = args.rawArgs

  if (!key || !url) {
    throw new Error('格式错误。例: nyrm add 别名 源地址')
  }

  (async () => {
    const configPath = path.resolve(__dirname, './config.json')

    const configJSON = await readFile(configPath, 'utf-8')
    const config = JSON.parse(configJSON)

    await writeFile(configPath, JSON.stringify(config)).then(() => {
      log(chalk.red(`添加成功，可使用 nyrm set ${key} 切换`))
    })
  })()
}

if (program.remove) {
  const { remove: key } = program;

  (async () => {
    const configPath = path.resolve(__dirname, './config.json')

    const configJSON = await readFile(configPath, 'utf-8')
    const config = JSON.parse(configJSON)

    const url = config[key];

    if (!url) {
      return log(chalk.red('该别名对应的仓库不存在'))
    }

    delete config[key]

    await writeFile(configPath, JSON.stringify(config))

    console.log('镜像源：' + url + '删除成功')
  })()
}

if (program.use) {
  const { exec } = require('child_process');

  const { use: alias } = program;

  (async () => {
    const configPath = path.resolve(__dirname, './config.json')
    const configJSON = await readFile(configPath, 'utf-8')
    const config = JSON.parse(configJSON)

    if (!config[alias]) {
      throw new Error(chalk.red('地址不存在，清先添加对应的地址'))
    }

    exec(`yarn config set registry ${config[alias]}`, function () {
      log(chalk.blue(`成功切换到:${config[alias]}`))
    })
  })()
}