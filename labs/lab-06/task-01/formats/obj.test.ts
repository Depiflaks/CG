import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { parseObj } from "./obj.ts";
import { parseMtl } from "./mtl.ts";
import { loadObj } from "./loadObj.ts";
import { VERTEX_COMPONENTS } from "./types.ts";

const TRIANGLE = "v 0 0 0\nv 1 0 0\nv 0 1 0\n";
const TRIANGLE_COMPONENTS = VERTEX_COMPONENTS * 3;
const TEST_ORIGIN = "https://example.test/models/";
const ASSET_DIRECTORY = resolve("public/lab-06/task-01/models");
const FLOAT_TOLERANCE = 0.00001;
const HTTP_FIXTURES: Record<string, string> = {
  "/model.obj": `${TRIANGLE}mtllib nested/model.mtl\nusemtl oak\nf 1 2 3`,
  "/nested/model.mtl": "newmtl oak\nKd .4 .5 .6\nmap_Kd wood.svg",
  "/unknown.obj": `${TRIANGLE}usemtl missing\nf 1 2 3`,
};

function createFixtureServer(): ReturnType<typeof createServer> {
  return createServer((request, response) => {
    const body = HTTP_FIXTURES[request.url ?? ""];
    response.writeHead(body ? 200 : 404);
    response.end(body);
  });
}

function verticesOf(source: string): Float32Array {
  const part = parseObj(source).parts[0];
  assert.ok(part);
  assert.ok(part.vertices.every(Number.isFinite));
  return part.vertices;
}

function triangleArea(vertices: Float32Array): number {
  let sum = 0;
  for (let start = 0; start < vertices.length; start += TRIANGLE_COMPONENTS) {
    const [a, b, c] = [0, 1, 2].map((index) => vertices.slice(start + index * VERTEX_COMPONENTS));
    assert.ok(a && b && c);
    sum += Math.abs(((b[0] ?? 0) - (a[0] ?? 0)) * ((c[1] ?? 0) - (a[1] ?? 0))
      - ((b[1] ?? 0) - (a[1] ?? 0)) * ((c[0] ?? 0) - (a[0] ?? 0))) / 2;
  }
  return sum;
}

void test("OBJ computes flat normals and default UV coordinates", () => {
  const vertices = verticesOf(`${TRIANGLE}f 1 2 3`);
  assert.equal(vertices.length, TRIANGLE_COMPONENTS);
  assert.deepEqual([...vertices.slice(3, VERTEX_COMPONENTS)], [0, 0, 1, 0, 0]);
});

void test("OBJ accepts every face index format and negative references", () => {
  const tables = `${TRIANGLE}vt 0.2 0.4\nvt 0.5 0.6\nvt 0.7 0.8\nvn 0 0 -1\n`;
  const faces = ["1 2 3", "1/1 2/2 3/3", "1//1 2//1 3//1", "-3/-3/-1 -2/-2/-1 -1/-1/-1"];
  for (const face of faces) assert.equal(verticesOf(`${tables}f ${face}`).length, TRIANGLE_COMPONENTS);
  const vertices = verticesOf(`${tables}f ${faces[3] ?? ""}`);
  assert.equal(vertices[5], -1);
  assert.ok(Math.abs((vertices[6] ?? 0) - 0.2) < FLOAT_TOLERANCE);
});

void test("OBJ triangulates a concave polygon with either winding", () => {
  const polygon = "v 0 0 0\nv 2 0 0\nv 2 2 0\nv 1 1 0\nv 0 2 0\n";
  for (const face of ["1 2 3 4 5", "5 4 3 2 1"]) {
    const vertices = verticesOf(`${polygon}f ${face}`);
    assert.equal(vertices.length, TRIANGLE_COMPONENTS * 3);
    assert.equal(triangleArea(vertices), 3);
  }
});

void test("OBJ projects vertical polygons and small polygons far from the origin", () => {
  const vertical = "v 0 0 0\nv 0 2 0\nv 0 2 2\nv 0 0 2\nf 1 2 3 4";
  const shifted = "v 1000 1000 0\nv 1000.01 1000 0\nv 1000.01 1000.01 0\nv 1000 1000.01 0\nf 1 2 3 4";
  assert.equal(verticesOf(vertical).length, TRIANGLE_COMPONENTS * 2);
  assert.equal(verticesOf(shifted).length, TRIANGLE_COMPONENTS * 2);
});

void test("OBJ handles comments, continuations, groups and material switches", () => {
  const source = `${TRIANGLE}mtllib a.mtl b.mtl\nmtllib a.mtl\nusemtl red paint\no chair\ng seat\ns 1\nf 1 2 \\\n3 # face\nusemtl blue\nf 3 2 1\nusemtl red paint\nf 1 2 3`;
  const model = parseObj(source);
  assert.deepEqual(model.libraries, ["a.mtl", "b.mtl"]);
  assert.deepEqual(model.parts.map(({ material }) => material), ["red paint", "blue"]);
  assert.equal(model.parts[0]?.vertices.length, TRIANGLE_COMPONENTS * 2);
});

void test("OBJ rejects malformed faces with line context", () => {
  for (const face of ["0 2 3", "1 2 4", "-4 2 3", "1.5 2 3", "1 2", "1/1 2/1 3/1", "1//1 2//1 3//1"]) {
    assert.throws(() => parseObj(`${TRIANGLE}f ${face}`), /Строка 4 \(f\)/);
  }
  assert.throws(() => parseObj("v NaN 0 0"), /Некорректное число/);
  assert.throws(() => parseObj(`${TRIANGLE}f 1 1 1`), /Вырожденная/);
  assert.throws(() => parseObj(`${TRIANGLE}f 1 2 \\\n3\nf 0 1 2`), /Строка 6 \(f\)/);
  assert.throws(() => parseObj(TRIANGLE), /не содержит/);
});

void test("MTL preserves ambient, diffuse, specular, shininess and relative texture paths", () => {
  const materials = parseMtl("newmtl oak\nKa .1 .2 .3\nKd .4 .5 .6\nKs .7 .8 .9\nNs 120\nmap_Kd ../wood grain.png",
    `${TEST_ORIGIN}materials/room.mtl`);
  assert.deepEqual(materials.get("oak"), {
    ambient: [0.1, 0.2, 0.3], diffuse: [0.4, 0.5, 0.6], specular: [0.7, 0.8, 0.9],
    shininess: 120, diffuseMap: `${TEST_ORIGIN}wood%20grain.png`,
  });
  assert.throws(() => parseMtl("newmtl\n", TEST_ORIGIN), /Строка 1/);
  assert.throws(() => parseMtl("newmtl oak\nmap_Kd -s 2 2 wood.png", TEST_ORIGIN), /без опций/);
});

void test("All bundled models parse and all referenced materials and textures exist", async () => {
  const files = await readdir(ASSET_DIRECTORY);
  const materials = parseMtl(await readFile(resolve(ASSET_DIRECTORY, "room.mtl"), "utf8"), `${TEST_ORIGIN}room.mtl`);
  const models = files.filter((name) => name.endsWith(".obj"));
  assert.ok(models.length >= 7);
  for (const name of models) {
    const model = parseObj(await readFile(resolve(ASSET_DIRECTORY, name), "utf8"));
    assert.deepEqual(model.libraries, ["room.mtl"]);
    assert.ok(model.parts.every(({ material, vertices }) => materials.has(material) && vertices.every(Number.isFinite)));
  }
  for (const material of materials.values()) {
    if (material.diffuseMap) assert.ok(files.includes(new URL(material.diffuseMap).pathname.split("/").at(-1) ?? ""));
  }
});

void test("HTTP loader resolves MTL and reports missing files, unknown materials and cancellation", async () => {
  const server = createFixtureServer();
  server.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${String(address.port)}`;
    const signal = new AbortController().signal;
    const parts = await loadObj(`${origin}/model.obj`, signal);
    assert.deepEqual(parts[0]?.material.diffuse, [0.4, 0.5, 0.6]);
    assert.equal(parts[0].material.diffuseMap, `${origin}/nested/wood.svg`);
    await assert.rejects(loadObj(`${origin}/absent.obj`, signal), /HTTP 404/);
    await assert.rejects(loadObj(`${origin}/unknown.obj`, signal), /Не найден материал missing/);
    await assert.rejects(loadObj(`${origin}/model.obj`, AbortSignal.abort()), { name: "AbortError" });
  } finally {
    server.closeAllConnections();
    server.close();
  }
});
