const mongoose = require("mongoose");

// Function to format the date as "yyyy-mm-dd"
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

// Define the News schema
const NewsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: { type: String, required: true },
  news: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: String, default: getCurrentDate }, // Use the function as default value
});

// Create the News model
const NewsModel = mongoose.model("News", NewsSchema);

module.exports = NewsModel;
