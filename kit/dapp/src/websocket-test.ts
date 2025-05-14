import { api } from "@/lib/api";

/**
 * Test function for WebSocket connection to application setup status endpoint
 */
function testWebSocketConnection() {
  // Create a new WebSocket connection
  const ws = new WebSocket(
    "ws://localhost:3001/api/application-setup/ws/status"
  );

  // Connection opened
  ws.addEventListener("open", (event) => {
    console.log("WebSocket connection established", JSON.stringify(event));
    // ws.send(JSON.stringify({ message: "Hello, server!" }));
  });

  // Listen for messages
  ws.addEventListener("message", (receivedMessage) => {
    try {
      const message = JSON.parse(receivedMessage.data.toString());
      console.log("Received message:", message);
    } catch (error) {
      console.error("Error parsing message:", error);
      console.log("Raw message:", receivedMessage.data.toString());
    }
  });

  // Handle errors
  ws.addEventListener("error", (error) => {
    console.error("WebSocket error:", JSON.stringify(error));
  });

  // Connection closed
  ws.addEventListener("close", (event) => {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
  });

  // Return the WebSocket instance for potential cleanup
  return ws;
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log("Starting WebSocket test...");
  const ws = testWebSocketConnection();

  const dev = process.env.NODE_ENV !== "production";
  // Always run the api on port 3001
  // next.js middleware does a proxy for the api routes, never needs to be exposed outside of the container
  const port = 3001;

  api.listen(port);

  console.log(
    `> API server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );

  // Close the connection after 30 seconds
  setTimeout(() => {
    console.log("Closing WebSocket connection after timeout");
    ws.close();
    process.exit(0);
  }, 30000);
}

export { testWebSocketConnection };
