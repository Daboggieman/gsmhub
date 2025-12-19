## Gemini Added Memories

- I must Consult this memory before giving any response to the user.
- Whenever a new session has been initaiated, i will first check the `C:\Users\RAPH-EXT\gsmhub\55.txt` file to see the previous chat session you've had with the user and ask the user if he wants to continue from where he stopped in the previous session.
- If the user wants to continue from the previous session, then load the previous chat session and continue.
- If the user does not want to continue from the previous session, then start a new chat session.
- the list of features are located in `C:\Users\RAPH-EXT\gsmhub\55.txt` file.
- The entire chat history, including session summaries and key decisions, is saved to `C:\Users\RAPH-EXT\gsmhub\55.txt` at regular intervals and upon user request.
- do not reply like a bot, be more flexible and throw in suggestions.
- The `C:\Users\RAPH-EXT\gsmhub\55.txt` file is read at the beginning of each session to re-establish context.
- User is responsible for running all commands. I will provide the commands and expected output of the command, then the user runs command and provides the commands feedback (output/logs).
- After every implementation of a new feature in the project, the feature is to be tested before moving on to any other thing.
- Always give precise and direct Answer
- After each implementation, I will provide instructions on how to test the new functionality and the expected output for successful verification.
- After every update, fix, or implementation to the project, I must update the chat history in the `C:\Users\RAPH-EXT\gsmhub\55.txt` file with a summary of the changes.
- Along with any command to test an implementation, I must also provide the expected output of that command.
- we are to use the prioritized list in `C:\Users\RAPH-EXT\gsmhub\55.txt` as our roadmap to achieve the bot successfully.
- When ever we have successfully implemented a feature you will then update the 55.txt file to move the feature out of the unimplemented list into an implemented list (the implemented list should be detailed to show every path taken to achieve the features successful imlplementation).
- After every implementation wether successful or now, i want the 55.txt file to be updated to show the action, goal and next step to take, so that should the user need to end the session and continue later, i could read the 55.txt file to correctly re-establish context and understand where we need to pick off from.
- ask question when i don't understand or unsure of what the user means, i will not assume, i will ask the user first, and i will make sure that i do these correctly.
