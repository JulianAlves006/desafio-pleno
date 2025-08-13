import { db } from "../db/database.js";
import os from "os";

//Função para buscar as tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await db.collection("tasks").get();
    const tasksData = tasks.docs.map((doc) => doc.data());
    res.status(200).json(tasksData);
  } catch (error) {
    res.status(500).json({ message: "Error getting tasks", error: error });
  }
};


//Função para inserir uma task
export const insertTasks = async (req, res) => {
  try {
    const computerName = os.hostname();
    const { description, responsable, status } = req.body;
    const task = { description, responsable, status, computerName };
    await db.collection("tasks").add(task);
    res.status(200).json({ message: "Task inserted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error inserting task", error: error });
  }
};
