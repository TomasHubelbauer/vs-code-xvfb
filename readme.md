# VS Code XVFB

I'm trying to find if it is possible to run VS Code in XVFB and capture its
screenshot using the Electron APIs and not have it come out black. That's what
currently happens for me in
https://github.com/TomasHubelbauer/vs-code-extension-test-screenshot

I started this spike to see if I will be able to reproduce it standalone but
unlike in the above mentioned project, where the code runs, but produces a black
image, in this project, the code crashes on the `assert`.

I have a suspicion it might be because of the indexer to the web contents, but
it is just a speculation.

## Running

First run VS Code with `--inspect` and dump its output to `code.log`:

- Bash: `code . --inspect --wait &> code.log &`
- PowerShell: `& code --inspect 2>&1 > code.log`

Then run `npm start`.

On Windows, I am unable to access `https://localhost:9229` or connect to the web
socket, but on Linux, in the GitHub Actions workflow, it runs. In the above
mentioned project, I am using `process._debugProcess` which probably makes a
difference, because that project runs on Windows, too. But that's not very
important for this spike, because this spike is all about reproducing and
hopefully fixing the black screenshot which only happens on Linux for me.

## To-Do

### Figure out why the result of the expression evaluation is falsy and trips the `assert`
