// ESM + Jest
import { jest } from "@jest/globals";

// 1) Mock do módulo de DB usado no controller
await jest.unstable_mockModule("../db/database.js", () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    get: jest.fn(),
  },
}));

// 2) IMPORTS reais só depois dos mocks (ordem importa)
const { db } = await import("../db/database.js");
const { getTasks } = await import("../controllers/tasksController.js");

describe("getTasks controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {}; // não precisa de body/params para getTasks
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("deve listar tasks e retornar 200", async () => {
    const fakeDocs = [
      { data: () => ({ description: "A", responsable: "R1", status: "done" }) },
      { data: () => ({ description: "B", responsable: "R2", status: "pending" }) },
    ];

    db.get.mockResolvedValueOnce({ docs: fakeDocs });

    await getTasks(req, res);

    expect(db.collection).toHaveBeenCalledWith("tasks");
    expect(db.get).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { description: "A", responsable: "R1", status: "done" },
      { description: "B", responsable: "R2", status: "pending" },
    ]);
  });

  it("deve tratar erro e retornar 500", async () => {
    const fakeErr = new Error("DB error");
    db.get.mockRejectedValueOnce(fakeErr);

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting tasks",
      error: fakeErr,
    });
  });
});
