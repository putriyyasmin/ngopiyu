const OSRM_URL = "https://router.project-osrm.org";

export async function getJarakOSM(userLat, userLong, cafes) {
  const valid = cafes.filter((c) => c.lat != null && c.long != null);
  if (valid.length === 0) return {};

  const koordinat = [
    `${userLong},${userLat}`,
    ...valid.map((c) => `${c.long},${c.lat}`),
  ].join(";");

  const url = `${OSRM_URL}/table/v1/driving/${koordinat}?sources=0&annotations=distance`;

  const res = await fetch(url);
  const body = await res.json();

  if (body.code !== "Ok" || !body.distances) {
    throw new Error("Gagal mengambil jarak dari OSRM");
  }

  const jarak = body.distances[0];
  const hasil = {};
  valid.forEach((c, i) => {
    hasil[c.nama_cafe] = jarak[i + 1];
  });
  return hasil;
}
