# GitHub Gist Test Automation Assignment

## Objective

Prepare a small, maintainable test automation solution for [GitHub Gist](https://gist.github.com/) that demonstrates your understanding of the product, its API, and the testing decisions you would make for a scalable automation project.

The solution does not need exhaustive coverage. Focus on the most critical functionality, explain your judgment, and include meaningful edge cases where they add value.

## Helpful Reference Links

| Area | Link |
| --- | --- |
| GitHub Gist REST API | [REST API endpoints for gists](https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#about-gists) |
| Gist web interface | [Creating gists](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists) |
| GitHub REST API basics | [Getting started with the REST API](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28) |
| Authentication | [Authenticating to the REST API](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28) |
| API rate limits | [Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) |
| Pagination | [Using pagination in the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api?apiVersion=2022-11-28) |
| REST API best practices | [Best practices for using the REST API](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28) |
| CI/CD | [GitHub Actions documentation](https://docs.github.com/en/actions) |
| JavaScript/TypeScript API testing | [Playwright API testing](https://playwright.dev/docs/api-testing) |
| Optional UI testing | [Playwright documentation](https://playwright.dev/docs/intro) |
| TypeScript | [TypeScript documentation](https://www.typescriptlang.org/docs/) |
| Node.js | [Node.js introduction](https://nodejs.org/learn/getting-started/introduction-to-nodejs) |

## Assignment

### 1. Project Familiarization

Please familiarize yourself with GitHub Gist functionality. In particular, you are expected to:

- Review the [GitHub Gist REST API documentation](https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#about-gists).
- Verify that you can call the relevant API endpoints successfully.
- Explore the [Gist web interface](https://gist.github.com/) and understand its main features and workflows.
- Pay attention to behavior around creating, reading, updating, deleting, starring, forking, listing, and viewing gist revisions where relevant.

### 2. Testing Strategy and Implementation

Once you are comfortable with both the API and the frontend, please:

- Outline the testing strategy you would adopt.
- Identify key test cases and scenarios, including important edge cases.
- Explain which tools and frameworks you would use and why.
- Prepare a small boilerplate project.
- Implement automated REST API tests.
- Optionally include a few UI tests as a plus.

Preferred implementation languages:

- JavaScript
- TypeScript


Please build your solution with extensibility, scalability, and ease of CI/CD integration in mind.

## Recommended Focus Areas

You are not expected to automate everything. Prioritize functionality that gives strong confidence in the most important Gist workflows.

Suggested API areas to consider:

- Create a secret or public gist with one or more files.
- Retrieve a gist and validate key response fields.
- Update a gist description, filename, or file content.
- Delete a gist and verify it can no longer be retrieved.
- Validate required fields and malformed payload behavior.
- Validate unauthorized or insufficient-permission requests.
- Check pagination and filtering where relevant.
- Consider rate-limit and cleanup behavior to keep the test suite reliable.

Suggested UI areas, if you include UI tests:

- Create a gist from the web interface.
- Edit an existing gist.
- Validate important user-facing messages or navigation states.
- Confirm that API-created data appears correctly in the UI.

## What We Will Discuss

During the interview, we will discuss:

- Your proposed testing strategy.
- Your project architecture and technical decisions.
- Ease of use and maintainability of your solution.
- Edge cases and risk areas you identified.
- The scalability of the project and approach.

## During the Interview

### Part 1: Presentation and Walkthrough

You will present your work, walk us through your thought process, describe your testing strategy, and explain the decisions you made.

You should also be prepared to walk through your code.

You are welcome to prepare supporting materials or notes in advance, although this is optional.

### Part 2: Live Test Implementation

You will be asked to implement one or two additional API tests during the interview based on a business scenario.

This part is intended to help us understand:

- How you think.
- How you approach problems.
- How you work in practice.
- How easily your project can be extended.

## Tips for Success

- Be curious: take time to understand the product and its behavior in depth.
- Stay organized: prepare notes, assumptions, and proposed test scenarios in advance.
- Share your thinking: if you see opportunities for improvement or have ideas beyond the basic requirements, feel free to discuss them.
- Keep the project easy to run locally and in CI.
- Document required environment variables, such as the GitHub token.
- Include clear setup and execution instructions.
- Make cleanup reliable so test data does not accumulate unnecessarily.

## Use of AI

We value thoughtful use of tools that improve productivity. However, for this assignment, we would prefer the work to be completed without using AI tools so we can better understand your own approach and decision-making.

## Closing

Congratulations again on making it this far. We look forward to learning more about your experience and thinking during the interview.

Please let us know if you have any questions or need clarification.
