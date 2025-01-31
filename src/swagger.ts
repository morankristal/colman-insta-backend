import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment 2 API",
      version: "1.0.0",
      description: "REST server with JWT authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
  schemas: {
    Comment: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          description: "Unique ID of the comment",
        },
        post: {
          type: "string",
          description: "ID of the post associated with the comment",
        },
        content: {
          type: "string",
          description: "Content of the comment",
        },
        sender: {
          type: "string",
          description: "ID of the user who created the comment",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Date when the comment was created",
        },
      },
    },
    CreateComment: {
      type: "object",
      properties: {
        post: {
          type: "string",
          description: "ID of the post associated with the comment",
          example: "63fabc12345def67890ghijk",
        },
        content: {
          type: "string",
          description: "Content of the comment",
          example: "This is a comment.",
        },
        sender: {
          type: "string",
          description: "ID of the user who is creating the comment",
          example: "63abc12345def67890ghijk",
        },
      },
    },
    UpdateComment: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "Updated content of the comment",
          example: "This is an updated comment.",
        },
      },
    },
    Post: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          description: "Unique ID of the post",
        },
        title: {
          type: "string",
          description: "Title of the post",
        },
        content: {
          type: "string",
          description: "Content of the post",
        },
        sender: {
          type: "string",
          description: "ID of the user who created the post",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Date when the post was created",
        },
      },
    },
    CreatePost: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the post",
          example: "New Post",
        },
        content: {
          type: "string",
          description: "Content of the post",
          example: "This is the content of the post.",
        },
        sender: {
          type: "string",
          description: "ID of the user creating the post",
          example: "63abc12345def67890ghijk",
        },
      },
    },
    UpdatePost: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Updated title of the post",
          example: "Updated Post Title",
        },
        content: {
          type: "string",
          description: "Updated content of the post",
          example: "This is the updated content of the post.",
        },
      },
    },
    User: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          description: "Unique ID of the user",
        },
        username: {
          type: "string",
          description: "Username of the user",
          example: "john_doe",
        },
        email: {
          type: "string",
          description: "Email address of the user",
          example: "john_doe@example.com",
        },
        password: {
          type: "string",
          description: "Password of the user (not shown in responses)",
          writeOnly: true, 
        },
        refreshToken: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of refresh tokens associated with the user",
        },
        profilePicture: {
          type: "string",
          description: "URL of the user's profile picture",
          example: "https://example.com/profile.jpg",
        },
      },
    },
    CreateUser: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username for the new user",
          example: "new_user123",
        },
        email: {
          type: "string",
          description: "Email address for the new user",
          example: "new_user@example.com",
        },
        password: {
          type: "string",
          description: "Password for the new user",
          example: "password123",
        },
        profilePicture: {
          type: "string",
          description: "Profile picture URL for the user",
          example: "https://example.com/new_profile.jpg",
        },
      },
    },
    UpdateUser: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Updated username",
          example: "updated_user",
        },
        email: {
          type: "string",
          description: "Updated email",
          example: "updated_user@example.com",
        },
        profilePicture: {
          type: "string",
          description: "Updated profile picture URL",
          example: "https://example.com/updated_profile.jpg",
        },
      },
    },
  },
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
},

  },
  apis: ["./src/routes/*.ts"], 
};

export default swaggerOptions;
