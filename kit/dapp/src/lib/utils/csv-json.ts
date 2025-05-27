export async function csvToJson(
  file: File,
  { lowerCase }: { lowerCase?: boolean } = {}
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        reject(new Error("Failed to read file content"));
        return;
      }

      const lines = text.split("\n");

      if (lines.length === 0) {
        resolve([]);
        return;
      }

      const headers = lines[0]
        .split(";")
        .map((header) => header.trim())
        .map((header) => (lowerCase ? header.toLowerCase() : header));

      const jsonResult = lines
        .slice(1)
        .filter((line) => line.trim() !== "") // Ignore empty lines
        .map((line) => {
          const values = line.split(";").map((value) => value.trim());
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index];
              return obj;
            },
            {} as Record<string, string>
          );
        });
      resolve(jsonResult);
    };

    reader.onerror = (e) => {
      reject(new Error("Error reading file: " + e.target?.error?.message));
    };

    reader.readAsText(file);
  });
}
