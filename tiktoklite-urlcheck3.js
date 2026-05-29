const { exec } = require('child_process');

// 装飾用のカラーコード定義
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  cyan:   "\x1b[36m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  bgBlue: "\x1b[44m"
};

const targetUrl = process.argv[2] || "https://tiktok.com";

// 開始のアナウンス（ヘッダー）
console.log(`\n${C.bgBlue}${C.bold} 🌐 URL PARSER ${C.reset}`);
console.log(`${C.cyan}Target:${C.reset} ${targetUrl}`);
console.log(`${C.yellow}Analyzing... Please wait.⏳${C.reset}\n`);

const command = `curl -sIL -o /dev/null -w "%{url_effective}" "${targetUrl}" | sed -e 's/?/\\n- /g' -e 's/\\&/\\n- /g'`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`\n${C.red}${C.bold}❌ 実行エラー:${C.reset} ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`\n${C.yellow}⚠️ エラー出力:${C.reset} ${stderr}`);
    return;
  }

  // --- 結果の装飾表示 ---
  console.log(`${C.green}${C.bold}✨ 解析結果 ✨${C.reset}`);
  console.log(`${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);

  // 各行をループして、ドメイン部分とパラメータ部分（- で始まる行）の色を変える
  const lines = stdout.trim().split('\n');
  lines.forEach((line, index) => {
    if (index === 0) {
      // 1行目はベースとなる有効URL
      console.log(` ${C.bold}🔗 Base URL:${C.reset} ${C.cyan}${line}${C.reset}`);
    } else {
      // 2行目以降（パラメータ）
      // 「- key=value」の構造を、イコールで分割してさらに見やすくする
      if (line.includes('=')) {
        const parts = line.split('=');
        const key = parts[0];
        const value = parts.slice(1).join('=');
          // ★★★ 【追加部分】ここでURLエンコードを元に戻す ★★★
        // TikTok Liteの2重エンコード対策として、一応2回デコードを通します
        let decodedValue = value;
        try {
          decodedValue = decodeURIComponent(decodeURIComponent(rawValue));
        } catch (e) {
          // 万が一デコードでエラーが出た場合は、そのままの値を出す安全設計
          try { decodedValue = decodeURIComponent(value); } catch(err) {}
        }
        // ★★★━━━━━━━━━━━━━━━━━━━━━━━━━━━━★★★
        console.log(`   ${C.yellow}${key}=${C.reset}${decodedValue}`);
      } else {
        console.log(`   ${line}`);
      }
    }
  });

  console.log(`${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);
});

