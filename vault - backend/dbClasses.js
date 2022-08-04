import mongoose from "mongoose";

const vaultSchema = mongoose.Schema({
  class: String,
  website: String,
  canvas: String,
  syllabus: String,
  chat: String,
});

export default mongoose.model("classcontents", vaultSchema);
