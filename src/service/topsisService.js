const CRITERIA_TYPE = {
  sentimen_score: "benefit",
  rating_cafe: "benefit",
  harga_avg: "cost",
  jumlah_ulasan: "benefit",
  jarak: "cost",
};

export function topsis(cafes, weights) {
  if (!cafes || cafes.length === 0) {
    return [];
  }

  const CRITERIA = Object.keys(weights);

  const data = cafes.map((c) =>
    typeof c.get === "function" ? c.get({ plain: true }) : c,
  );

  const jarakMap = {};
  for (const c of data) jarakMap[c.nama_cafe] = c.jarak ?? null;

  const norms = {};
  for (const key of CRITERIA) {
    const sumsq = data.reduce(
      (sum, c) => sum + Math.pow(parseFloat(c[key]) || 0, 2),
      0,
    );
    norms[key] = Math.sqrt(sumsq);
  }

  const normalized = data.map((c) => {
    const row = { nama_cafe: c.nama_cafe, kategori: c.kategori };

    for (const key of CRITERIA) {
      row[key] = norms[key] === 0 ? 0 : (parseFloat(c[key]) || 0) / norms[key];
    }
    return row;
  });

  const weighted = normalized.map((c) => {
    const row = { nama_cafe: c.nama_cafe, kategori: c.kategori };
    for (const key of CRITERIA) {
      row[key] = c[key] * (weights[key] || 0);
    }
    return row;
  });

  const idealPos = {},
    idealNeg = {};
  for (const key of CRITERIA) {
    const vals = weighted.map((c) => c[key]);

    if (CRITERIA_TYPE[key] === "benefit") {
      idealPos[key] = Math.max(...vals);
      idealNeg[key] = Math.min(...vals);
    } else {
      idealPos[key] = Math.min(...vals);
      idealNeg[key] = Math.max(...vals);
    }
  }

  const hasil = weighted.map((c) => {
    const dPos = Math.sqrt(
      CRITERIA.reduce(
        (sum, key) => sum + Math.pow(c[key] - idealPos[key], 2),
        0,
      ),
    );
    const dNeg = Math.sqrt(
      CRITERIA.reduce(
        (sum, key) => sum + Math.pow(c[key] - idealNeg[key], 2),
        0,
      ),
    );
    const skor = dPos + dNeg === 0 ? 0 : dNeg / (dPos + dNeg);
    return {
      nama_cafe: c.nama_cafe,
      kategori: c.kategori,
      topsis_score: parseFloat(skor.toFixed(4)),
      d_positif: parseFloat(dPos.toFixed(4)),
      d_negatif: parseFloat(dNeg.toFixed(4)),
      jarak: jarakMap[c.nama_cafe],
    };
  });

  hasil.sort((a, b) => b.topsis_score - a.topsis_score);
  return hasil.map((r, i) => ({ rank: i + 1, ...r }));
}
