# Request Rocket

Request Rocket is a powerful API testing tool designed to streamline the process of creating, testing, and managing API requests. Built with SvelteKit, Tailwind CSS, and Tauri, Request Rocket offers a robust set of features to enhance your API development workflow.

## Features

- **Request Creation**: Easily create and customize API requests, supporting all major HTTP methods (GET, POST, PUT, DELETE). Choose from various body types, including JSON, XML, form data, and form-urlencoded.
- **Request History**: Automatically save and organize your API requests into history. Group requests for better management and quick access.
- **Variable Replacement**: Define and use variables within your requests to manage dynamic content effortlessly.
- **Group Management**: Organize your requests into groups to keep related requests together, improving organization and efficiency.
- **Response Viewer**: View and format responses with syntax highlighting, including status, duration, and size of the response.
- **Persistent Storage**: Use IndexedDB to store requests and variables, ensuring your data is saved across sessions.

## Screenshots



## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)
- [Tauri CLI](https://tauri.studio/en/docs/getting-started/intro)

### Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/genc-murat/requestrocket.git
   cd request-rocket
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the application in development mode:**
   ```sh
   npm run dev
   ```

4. **Build the application for production:**
   ```sh
   npm run build
   ```

5. **Package the application with Tauri:**
   ```sh
   npm run tauri build
   ```

## Usage

### Creating Requests

1. **Select HTTP Method:** Choose the desired HTTP method from the dropdown (GET, POST, PUT, DELETE).
2. **Enter URL:** Input the API endpoint URL.
3. **Add Headers and Parameters:** Click on "Add Header" or "Add Param" buttons to include headers and parameters.
4. **Specify Body:** Select the body type (JSON, XML, form data, form-urlencoded) and enter the request body.

### Managing History

- **Automatic Saving:** Requests are automatically saved to history after execution.
- **Organize by Groups:** Group requests to keep related requests together. Create new groups as needed.

### Using Variables

1. **Define Variables:** Open the Variables panel and add new variables with key-value pairs.
2. **Use in Requests:** Use `{{variableName}}` syntax in URLs, headers, and body to replace with variable values dynamically.

### Viewing Responses

- **Response Details:** View status, duration, and size of the response.
- **Formatted Output:** Response body is displayed with syntax highlighting for easy reading.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. **Fork the repository:**
   ```sh
   git fork https://github.com/yourusername/request-rocket.git
   ```

2. **Create a new branch:**
   ```sh
   git checkout -b feature-branch
   ```

3. **Make your changes and commit:**
   ```sh
   git commit -m 'Add new feature'
   ```

4. **Push to the branch:**
   ```sh
   git push origin feature-branch
   ```

5. **Create a Pull Request:**
   - Go to your forked repository on GitHub.
   - Click on the "Compare & pull request" button.
   - Submit your pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [SvelteKit](https://kit.svelte.dev/) - The framework used for building the application.
- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework.
- [Tauri](https://tauri.studio/) - For packaging the application.
- [Prism.js](https://prismjs.com/) - Syntax highlighting library.
- [FontAwesome](https://fontawesome.com/) - Icons library.
