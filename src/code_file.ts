// Define an enum for different types of fruits
enum FileType {
    SOURCE,
    HEADER,
    TEXT,
}

// Define a struct for a fruit
interface CodeFile {
    file_name: String;
    file_type: FileType;
}
