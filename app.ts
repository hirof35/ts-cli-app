import * as fs from 'fs';
import * as path from 'path';

const DB_FILE = "conversion_history.csv";

interface ConversionData {
  時刻: string;
  カテゴリー: string;
  変換前: string;
  変換後: string;
  数値: number;
}

function loadData(): ConversionData[] {
  const filePath = path.join(process.cwd(), DB_FILE);

  console.log(`[チェック] 読み込み対象ファイル: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log("⚠️ 警告: CSVファイルが見つかりません。新規作成します。");
    const sampleData = `時刻,カテゴリー,変換前,変換後,数値\n2026-05-15 12:00,長さ,m,cm,100\n2026-05-15 13:00,重さ,kg,g,2500\n2026-05-15 14:00,長さ,km,m,5000`;
    fs.writeFileSync(filePath, sampleData, 'utf-8');
    console.log("💡 サンプルデータを含む conversion_history.csv を作成しました。");
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  
  if (lines.length <= 1) {
    console.log("ℹ️ ファイルは存在しますが、ヘッダーのみ、または空っぽです。");
    return [];
  }

  const headers = lines[0].split(',');
  const data: ConversionData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length === headers.length) {
      data.push({
        時刻: values[0],
        カテゴリー: values[1],
        変換前: values[2],
        変換後: values[3],
        数値: Number(values[4])
      });
    }
  }

  console.log(`[成功] ${data.length} 件のデータを読み込みました。\n`);
  return data;
}

function main() {
  console.log("========================================");
  console.log("📊 CMDで彩る高度な単位変換ダッシュボード");
  console.log("========================================\n");

  try {
    const df = loadData();

    if (df.length > 0) {
      console.log("【変換トレンドの分析 (履歴一覧)】");
      console.table(df);
      console.log("\n----------------------------------------\n");

      console.log("【単位変換の推移（簡易グラフ）】");
      const maxVal = Math.max(...df.map(d => d.数値), 1);
      df.forEach(row => {
        const barLength = Math.max(1, Math.round((row.数値 / maxVal) * 30));
        const bar = "■".repeat(barLength);
        console.log(`${row.時刻} [${row.カテゴリー}] ${row.数値.toString().padEnd(6)} : ${bar}`);
      });
      console.log("\n----------------------------------------\n");

      console.log("【カテゴリー別の利用割合】");
      const categoryCounts: Record<string, number> = {};
      df.forEach(row => {
        categoryCounts[row.カテゴリー] = (categoryCounts[row.カテゴリー] || 0) + 1;
      });

      const summary = Object.keys(categoryCounts).map(cat => {
        // countが安全に取得できるよう修正
        const count = categoryCounts[cat] || 0;
        return {
          カテゴリー: cat,
          回数: count,
          割合: `${((count / df.length) * 100).toFixed(1)}%`
        };
      });
      console.table(summary);

    } else {
      console.log("ℹ️ データがたまると、ここにリッチなグラフが表示されます。");
    }
  } catch (error) {
    console.error("❌ 実行中にエラーが発生しました:", error);
  }
}

main();