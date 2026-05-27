# Overview
This is a tool that helps to design FSMs for hardware implementation. It uses AI to analyse the design. It has a web app that lets you drag and drop the state machine.

## Scope
* Canvas to draw the state machine
* AI interaction to give feedback and make improvements.
* Code generation to setup the state machine and transitions.
    * C
    * Verilog/VHDL

# Tools used
* React flow: I've never worked with React before, will try to setup a nice drag and drop interface.
* AI APIs:

# Tasks
- [ ] Implement diagramming tool
- [ ] Store state machine in a datastructure that can be passed to AI
- [ ] Call API at the click of a button
- [ ] Get multiple outputs:
    - Natural language feedback
    - Suggestions to change the state machine (1-click implementation)
- [ ] Undo button
- [ ] For interactivity with AI: Be able to provide context about the state machine's purpose to the AI

---

# Final implementation notes
- The app is working in the way I would expect.
- There are further improvements that can be made
    - Removing states
    - Better edge routing
- Most of the implementation was done with the help of gemini flash 3.5
