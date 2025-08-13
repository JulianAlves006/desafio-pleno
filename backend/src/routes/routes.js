import express from "express";
import { getTasks, insertTasks } from "../controllers/tasksController.js";
const router = express.Router();

router.get("/get-tasks", getTasks);

router.post("/insert-task", insertTasks);

export default router;