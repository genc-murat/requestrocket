# Request Rocket

**⚠️ Note: Request Rocket is currently under active development. Features and functionalities are being added and improved regularly.**

<div align="center">
    <img src="/icon.png" alt="Request Rocket Icon">
</div>

Request Rocket is a powerful API testing tool designed to streamline the process of creating, testing, and managing API requests. Built with SvelteKit, Tailwind CSS, and Tauri, Request Rocket offers a robust set of features to enhance your API development workflow.

## Features

- **Request Creation**:
  - **Easy Setup**: Easily create and customize API requests.
  - **HTTP Methods**: Supports all major HTTP methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, CONNECT, and TRACE.
  - **Body Types**: Choose from various body types, including JSON, XML, form data, and form-urlencoded.
  - **Custom Headers**: Define and manage custom headers for your requests, with autocomplete support for quick entry.
  - **Parameter Management**: Easily add and manage URL parameters.

- **Request History**:
  - **Automatic Saving**: Requests are automatically saved to history after execution.
  - **Organization**: Group requests for better management and quick access.
  - **Manage History**: Duplicate, delete, and organize history items with ease.

- **Variable Replacement**:
  - **Define Variables**: Define and use variables within your requests.
  - **Dynamic Replacement**: Replace dynamic content effortlessly using `{{variableName}}` syntax.

- **Group Management**:
  - **Organize Requests**: Organize your requests into groups to keep related requests together.
  - **Create New Groups**: Create new groups as needed to improve organization and efficiency.

- **Response Viewer**:
  - **Formatted Output**: View and format responses with syntax highlighting.
  - **Response Details**: Display status, duration, and size of the response.
  - **Tab Views**: Switch between JSON, Table, Headers, and cURL command views.

- **Persistent Storage**:
  - **IndexedDB**: Use IndexedDB to store requests and variables.
  - **Session Persistence**: Ensure your data is saved across sessions for consistent access.

- **Import/Export**:
  - **Postman Integration**: Import Postman collections to easily migrate existing requests.
  - **Export Requests**: Export requests to Postman format for sharing and collaboration.
  - **API Documentation**: Generate and download API documentation based on request history.

- **JSON Editor Integration**:
  - **Powerful Editing**: Edit JSON data using a powerful JSON editor with support for code, tree, and text modes.
  - **Theme Support**: Switch between light and dark themes for the JSON editor.

- **Status History**:
  - **Track History**: Track and display status history for each request URL.
  - **Categorization**: Categorize history items by time (last hour, today, older).

- **API Flow Designer** (Under Development):
  - **Visual Design**: Design and manage API request flows visually using a drag-and-drop interface.
  - **Block Types**: Create and connect various block types to define the sequence of API requests and logical operations.
    - **API Call**: Make API calls to external services.
    - **Condition**: Conditional branching based on the response.
    - **Loop**: Repeat actions for a specified number of times or until a condition is met.
    - **Variable**: Define and use variables within the flow.
    - **JSON Transformer**: Transform JSON data from one format to another.
    - **Regex**: Apply regular expression transformations.
    - **Webhook**: Listen for incoming HTTP requests.
    - **Custom Script**: Execute custom JavaScript code.
    - **Try-Catch**: Error handling blocks.
    - **Switch-Case**: Conditional branching with multiple cases.
    - **Authentication**: Handle authentication for API calls.
    - **Comment**: Add comments to the flow.
    - **Group**: Organize blocks into groups.
    - **Start**: Define the start of the flow.
    - **End**: Define the end of the flow.
  - **Auto-Arrange**: Automatically arrange blocks for a cleaner layout.
  - **Connection Types**: Support for various connection types such as next, alternative, and error paths.
  - **Validation**: Validate flow structure and connections to ensure logical consistency.
  - **Properties Panel**: Edit properties of blocks such as URLs, conditions, and transformation functions.
  - **Undo/Redo**: Maintain a history of changes with undo and redo functionality.
  - **Zoom and Pan**: Navigate the flow diagram with zoom and pan capabilities.
  - **Minimap**: Overview of the entire flow for easier navigation.
  - **Context Menu**: Right-click context menu for quick actions like duplication and deletion of blocks.

## Screenshots

[Add screenshots here]

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

1. **Select HTTP Method:** Choose the desired HTTP method from the dropdown (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, CONNECT, TRACE).
2. **Enter URL:** Input the API endpoint URL.
3. **Add Headers and Parameters:** Click on "Add Header" or "Add Param" buttons to include headers and parameters.
4. **Specify Body:** Select the body type (JSON, XML, form data, form-urlencoded) and enter the request body.

### Managing History

- **Automatic Saving:** Requests are automatically saved to history after execution.
- **Organize by Groups:** Group requests to keep related requests together. Create new groups as needed.
- **Duplicate and Delete:** Easily duplicate or delete history items.

### Using Variables

1. **Define Variables:** Open the Variables panel and add new variables with key-value pairs.
2. **Use in Requests:** Use `{{variableName}}` syntax in URLs, headers, and body to replace with variable values dynamically.

### Viewing Responses

- **Response Details:** View status, duration, and size of the response.
- **Formatted Output:** Response body is displayed with syntax highlighting for easy reading.
- **Tab Views:** Switch between JSON, Table, Headers, and cURL command views.

### Importing and Exporting

- **Import Postman Collections:** Easily import existing Postman collections to migrate requests.
- **Export Requests:** Export requests to Postman format for sharing and collaboration.
- **Generate API Documentation:** Create and download API documentation based on request history.

### Editing JSON Data

- **JSON Editor:** Edit JSON data using a powerful JSON editor with support for code, tree, and text modes.
- **Theme Support:** Switch between light and dark themes for the JSON editor.

### Tracking Status History

- **Status History:** Track and display status history for each request URL.
- **Categorize by Time:** View history items categorized by time (last hour, today, older).

### Managing Custom Headers

- **Custom Headers:** Define and manage custom headers for your requests.
- **Autocomplete:** Use autocomplete for quick entry of header names.

### Designing API Flows

1. **Open API Flow Designer:** Navigate to the API Flow Designer interface.
2. **Add Blocks:** Drag and drop blocks such as API calls, conditions, loops, and variables to the canvas.
3. **Connect Blocks:** Draw connections between blocks to define the flow of API requests and logical operations.
4. **Edit Properties:** Select a block to edit its properties in the properties panel.
5. **Validate Flow:** Use the validate button to ensure the flow structure is logically consistent.
6. **Save and Run:** Save the flow and run it to execute the API requests in the defined sequence.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. **Fork the repository:**
   ```sh
   git fork https://github.com/genc-murat/request-rocket.git
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
- [Tauri](https://tauri.studio/) - For packaging

 the application.
- [JSONEditor](https://github.com/josdejong/jsoneditor) - JSON editor library.
- [FontAwesome](https://fontawesome.com/) - Icons library.