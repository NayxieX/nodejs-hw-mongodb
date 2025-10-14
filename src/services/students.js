import { StudentsCollection } from "../db/models/students.js";

export async function getAllStudents() {
  const students = await StudentsCollection.find();
  return students;
}

export async function getStudentById(studentId) {
  const student = await StudentsCollection.findById(studentId);
  return student;
}
