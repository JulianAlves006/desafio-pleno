// ESM + Jest
import { jest } from "@jest/globals";

// 1) Mock do módulo de DB (no formato que seu controller usa)
await jest.unstable_mockModule("../db/database.js", () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
  },
}));

// 2) Mock do os.hostname()
await jest.unstable_mockModule("os", () => ({
  default: { hostname: jest.fn(() => "fake-computer") },
}));

// 3) IMPORTS depois dos mocks (ordem importa!)
const { db } = await import("../db/database.js");
const { insertTasks } = await import("../controllers/tasksController.js");

describe("insertTasks controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        description: "Test task",
        responsable: "John Doe",
        status: "pending",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("deve inserir a task e retornar 200", async () => {
    db.add.mockResolvedValueOnce({}); // simula sucesso

    await insertTasks(req, res);

    expect(db.collection).toHaveBeenCalledWith("tasks");
    expect(db.add).toHaveBeenCalledWith({
      description: "Test task",
      responsable: "John Doe",
      status: "pending",
      computerName: "fake-computer",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Task inserted successfully" });
  });

  it("deve tratar erro e retornar 500", async () => {
    const fakeErr = new Error("DB error");
    db.add.mockRejectedValueOnce(fakeErr);

    await insertTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error inserting task",
      error: fakeErr,
    });
  });
});
