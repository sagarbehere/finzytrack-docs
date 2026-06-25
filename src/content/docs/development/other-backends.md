---
title: hledger and Other Ledger Backends
description: Why Finzytrack is built on Beancount only, and what supporting hledger or Ledger would actually require.
sidebar:
  order: 3
---

Finzytrack uses [Beancount](https://beancount.github.io/) as its one and only ledger backend. People who use [hledger](https://hledger.org/) or the original [Ledger](https://ledger-cli.org/) have asked whether Finzytrack can sit on top of their journals instead. This page explains, in detail, how Finzytrack uses Beancount today, what it would take to support another backend at various levels of completeness, and why — for the foreseeable future — the answer is "not planned."

This page is written for the curious power user as a design-rationale document, not a roadmap.

## The short version

Finzytrack was designed from day one as a graphical front-end for Beancount, with the explicit goal that the *user* never has to see or think about Beancount. To deliver that, the app leans heavily and directly on Beancount's data model and libraries. There is no internal abstraction layer that separates "a transaction" from "a Beancount transaction." Supporting a second backend cleanly means building that abstraction, owning the accounting semantics it implies, and then maintaining it across two (or more) independent projects forever. That cost is large, and it works against the very thing that makes Finzytrack pleasant — its narrow, opinionated, GUI-first focus.

## How Finzytrack uses Beancount today

A few facts about the architecture explain why this is harder than it looks.

**Beancount's data model *is* Finzytrack's data model.** When the app loads a ledger, it uses Beancount's own loader, and the resulting objects — transactions, postings, accounts, balance assertions, commodities, prices, documents — flow through the backend, the API, and even into the frontend's type definitions essentially unchanged. There is no neutral "Finzytrack transaction" that Beancount is translated into. Beancount is not behind a curtain; it is the stage.

**Reads come from a SQLite mirror.** On load and after every change, Finzytrack exports the ledger into a SQLite database, and almost everything you see — dashboards, balances, the account tree, transaction lists — is built by querying that database. This part is, happily, format-agnostic: anything that can populate the same SQLite schema would light up the read side. This is the one place where a second backend would get real leverage.

**Writes are whole-file rewrites through Beancount's printer.** When you add or edit a transaction, Finzytrack re-parses the ledger, modifies the in-memory list of entries, and rewrites the entire file using Beancount's canonical formatter. This guarantees a consistent, valid file, and it relies on Beancount-specific behavior (for example, filtering out the padding transactions Beancount synthesizes from `pad` and `balance` directives).

**The five account roots are assumed in code, in math, and in content.** Beancount requires every account to start with one of `Assets`, `Liabilities`, `Equity`, `Income`, or `Expenses`. Finzytrack relies on this in three different ways: validation code enforces it, the balance math distinguishes balance-sheet accounts (`Assets`/`Liabilities`/`Equity`, shown as a point-in-time balance) from income-statement accounts (`Income`/`Expenses`, shown as a period total), and the **default dashboard recipes that ship with the app** filter on prefixes like `Expenses:` and `Income:`. The assumption is baked into the product's content, not just its plumbing.

**Beancount's library does accounting work you don't see.** Lot reduction and cost-basis booking, pairing `pad` directives with `balance` assertions, aggregating positions into inventories, and reporting errors are all handled by Beancount. Finzytrack benefits from this without having to implement or fully understand it.

## hledger and Ledger are similar — but not the same model

hledger and Ledger share a family resemblance with Beancount, and for clean, conventionally-structured files the overlap is large. The differences, however, fall exactly where Finzytrack is most coupled.

- **Account names are flexible.** hledger and Ledger impose no required root accounts, allow lowercase and spaces, and treat account *types* as optional, declared or inferred metadata rather than a fixed five-way taxonomy. Finzytrack's type-driven balance math and its default dashboards assume the Beancount taxonomy.
- **Tags and links differ.** Beancount has both `#tags` and `^links`; hledger has only `tag:value` annotations inside comments and no separate link concept. Round-tripping one into the other loses information.
- **Virtual postings exist in hledger and Ledger but not in Beancount.** A posting in parentheses or brackets need not balance the way a normal posting does. Beancount cannot represent these at all.
- **Balance assertions are modeled differently.** Beancount uses a standalone, dated `balance` directive; hledger and Ledger attach assertions inline to a posting.
- **There is no document directive in hledger.** Finzytrack's document-attachment feature is built on Beancount's `Document` directive, which has no native hledger equivalent.
- **Account lifecycle differs.** Beancount requires dated `open` (and optional `close`) directives; hledger's `account` directive is optional and carries no open/close lifetime.

These are not bugs in any of the tools. They are honest differences between accounting models, and they are the reason a shared abstraction cannot be perfectly clean — some concepts will always have to be exposed or hidden per-backend.

## Levels of support, and what each would cost

There is a spectrum here, not a single yes/no. Each level is meaningfully more work than the last.

### Level 0 — Convert on read (the tempting shortcut)

hledger ships a converter: `hledger print -O beancount` emits a Beancount-format file, which Fava (and in principle Finzytrack) can then read (See [here](https://hledger.org/beancount.html) for more.). This looks like it might give hledger support almost for free.

It does not hold up as a product foundation. To make hledger data fit Beancount's stricter rules, the converter rewrites account names — capitalising each component, replacing spaces with hyphens, hex-encoding unsupported characters, mapping a top-level `revenue` to `Income`, and requiring manual aliases for any other non-standard root. It also drops virtual postings and certain conversion postings. The practical consequences:

- **It inverts Finzytrack's core promise.** An hledger user would see their own accounts rendered in mangled, Beancount-flavoured form (`assets:bank account` becomes `Assets:Bank-account`; unusual names become hex). The whole point of Finzytrack is that you never see the backend; this makes the backend the first thing you see.
- **The default dashboards still break.** Because they assume the five roots, any hledger file that doesn't already follow that convention produces a broken first-run experience even after conversion.
- **It is lossy and one-way**, so it could never support editing.

Level 0 is fine for a personal "peek at my data in a GUI" experiment. It is not a basis for a feature Finzytrack would put its name on.

### Level 1 — Native read-only

A more honest read-only mode would read hledger natively (via `hledger print` machine-readable output), preserve the user's real account names, and populate the same SQLite schema the dashboards already use. This is the most attractive level, because the read side is where Finzytrack is least coupled.

It still requires real work:

- An hledger loader that invokes the hledger binary and parses its output, including careful reconstruction of exact decimal amounts (hledger's machine-readable amounts are a mantissa/scale pair, not a plain number, and the floating-point field it also provides is rounded — using it would violate Finzytrack's exact-decimal money contract).
- A SQLite exporter that maps hledger's model onto the existing schema, including inferring or requiring account *types* so the balance-sheet-vs-income-statement math still works.
- Default dashboards that no longer assume the five roots, or a per-backend set of dashboards.
- A capability system so the app can disable everything that writes, and a frontend that greys out those actions clearly rather than letting them fail.

What you would get: dashboards, balances, account browsing, transaction viewing and filtering, and the read-only ("analyst") AI. What you would *not* get: the import → categorise → commit workflow, transaction and account editing, document attachment, and anything else that writes — which is a large part of what makes Finzytrack more than a report viewer.

### Level 2 — Full parity (read and write)

Full parity means an hledger user gets the same experience a Beancount user does. This is where the cost becomes structural rather than incremental.

- **A neutral domain model.** The app's internals would have to stop speaking Beancount and start speaking a backend-neutral model, with each backend translating to and from it. This touches the loader, the writer, the SQLite exporter, every API route that constructs ledger entries, and the frontend types.
- **A second, fundamentally different write strategy.** Beancount's whole-file rewrite is safe because Beancount's printer is canonical. hledger's printer is *not* a safe whole-file round-trip — it drops directives and comments and re-normalises number formatting — so writes would have to be surgical edits that splice into the file while leaving everything untouched, validated afterwards by running hledger's own checker.
- **Backend-specific feature handling** for documents (no hledger directive exists), virtual postings, links, and balance assertions — each either modelled, emulated, or explicitly unavailable.
- **Backend-aware importers and AI.** The import pipeline and the write-capable AI tools both produce ledger entries and would need to target whichever backend is active.

## The cross-cutting reasons it is not planned

Underneath the per-level detail are a few problems that apply no matter how far you go.

**You inherit accounting semantics you currently get for free.** Today, Finzytrack trusts Beancount's libraries to handle booking, balancing, padding, inventories, and error checking. The moment the app owns a neutral model and its own export from a second backend, it owns the *correctness* of those semantics on that backend. That is a deep, ongoing responsibility — arguably the single biggest hidden cost — for a project whose focus is interface design, not accounting-engine implementation.

**No abstraction over these models is leak-free.** Virtual postings, the tag/link split, and the five-root taxonomy are genuinely divergent. A shared model can manage these differences, but it cannot hide them; they surface as capability differences in the UI. The clean ideal does not exist, so the realistic target is "explicit, well-managed leaks," which is more work to get right than it sounds.

**Querying does not transfer.** Finzytrack's reports run as SQL over the SQLite mirror, which is backend-neutral and would carry over. But the Beancount-specific query language (BQL) Finzytrack also exposes has no hledger equivalent and would simply be unavailable there.

**Operational overhead.** A second backend means bundling and version-pinning the hledger binary in the desktop app, tracking the stability of its machine-readable output format (which is explicitly experimental and has changed between releases), and respecting its license terms by keeping it at arm's length as a separate process.

**A permanent maintenance tax.** This is the cost that outlasts the build. With two backends, every future feature has to be designed, built, and tested for both — including the AI workflows. For a solo, GUI-focused project, that tax compounds indefinitely, and it lands hardest on a backend the maintainer does not personally use and therefore cannot easily dogfood.

## The current decision

Finzytrack will remain Beancount-only for the foreseeable future. This is a focus decision, not a judgement about hledger or Ledger, which are excellent tools. Supporting them well would mean rebuilding Finzytrack around a backend-neutral accounting model and carrying that model — and the correctness of two accounting engines — for the life of the project, in exchange for serving users the maintainer cannot dogfood. The trade-off does not currently favour the product's core strength: being a focused, easy-to-use graphical front-end for one plain-text accounting system, done well.

If you are a developer using hledger or Ledger yourself and this document reads like a solvable problem to you, please open a [GitHub issue](https://github.com/sagarbehere/finzytrack/issues) to discuss it. Note, though, that Finzytrack is a personal project and is not accepting pull requests (see the project README) — so treat this as an invitation to talk, not to send patches.
