# Local CV workflow

The website and CV publication lists share one source of truth:
`content/publications.json`.

## Edit publications

On macOS, double-click `Start CV Studio.command` in the project folder. This is
the recommended method because it does not ask the package manager to install
or update anything.

Alternatively, if Node and pnpm are configured in your Terminal, run:

```sh
pnpm cv:studio
```

Open `http://127.0.0.1:4174`, edit the form, and choose **Save all changes**.
The public Publications page will use the saved records on its next build.

Choose **Edit rest of CV** to change the profile/header, education, research
experience, funding, field research, service, awards, outreach, skills, local
engagement, mentoring, and conference abstracts. Every section uses guided
fields; no LaTeX editing is required. Enter one bullet per line in bullet fields.

Closing the final CV Studio browser tab automatically stops the local server a
few seconds later. The launcher Terminal process exits with it.

## Generate LaTeX

Choose **Generate LaTeX** inside CV Studio. This is the recommended method and
does not require a terminal command.

Alternatively, run:

```sh
pnpm cv:generate
```

This combines `content/cv-sections.json` with the structured publication data
and writes `cv/generated/main.tex`. It does not modify the source file in
Downloads.

To re-import every non-publication section from a different source file:

```sh
CV_SOURCE_TEX=/absolute/path/to/main.tex pnpm cv:import
```

Compile `cv/generated/main.tex` with your usual LaTeX editor. A later automation
step can compile the PDF and regenerate the mobile WebP pages during deployment.

## Visibility controls

- **Show on website** includes a publication on `/publications`.
- **Show in CV** includes it in generated LaTeX.
- Records may appear in either destination or both.
