// src/lib/cookie-util.ts

import fs from 'fs';
import path from 'path';

// Define a type for the cookie structure in your JSON file
interface Cookie {
  name: string;
  value: string;
}

/**
 * Reads a cookies.json file from the project root, parses it,
 * and formats it into a single string for use in an HTTP header.
 * @param filePath The path to the cookie file, defaults to 'cookies.json' in the root.
 * @returns A formatted cookie string (e.g., "name1=value1; name2=value2").
 */
export const getCookieStringFromFile = (fileName: string = 'cookies.json'): string => {
  try {
    // Construct the full path to the file in the project's root directory
    const filePath = path.join(process.cwd(), fileName);

    // Read the file synchronously
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse the JSON content
    const cookies: Cookie[] = JSON.parse(fileContent);

    // Map the array of cookie objects to a single string
    // This will automatically include your csrftoken and sessionid
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    return cookieString;

  } catch (error) {
    console.error(`\n❌ Error reading or parsing the cookie file: ${fileName}`);
    console.error("Make sure the file exists in your project root and is a valid JSON array.");
    throw new Error("Could not process cookie file.");
  }
};