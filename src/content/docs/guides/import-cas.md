---
title: Importing Indian mutual funds (CAS)
description: Get the detailed CAMS + KFintech statement for all your mutual funds, and import it with its full history.
sidebar:
  order: 2
---

In India, one statement covers every mutual fund you hold: the **Consolidated Account
Statement (CAS)** from CAMS and KFintech. It lists every folio under your PAN, across all
fund houses, with every purchase, SIP instalment, redemption, switch, dividend and stamp
duty since your first investment.

Finzytrack reads this PDF on your computer. It does not use AI and does not send the file
anywhere. One import gives you every fund with its full history, cost, dividends and a
current value, and checks that the units add up for every fund.

## 1. Get the right statement

Request the CAS from the CAMS website, the KFintech website or MFCentral. Choose these
options:

- **Statement type: Detailed** (the one with transactions). The *Summary* statement has
  only your holdings, so Finzytrack can't build their history from it.
- **Period: a specific period that starts before your first investment** (for example,
  1 January 2000) and ends today. A shorter period leaves out the purchases your current
  holdings came from.
- **Include folios with zero balance.** Funds you sold long ago are part of your history
  and returns.
- **A password you choose.** The statement is emailed to you as a PDF protected by this
  password.

It usually arrives within minutes. Funds held in a demat account (NSDL or CDSL) are not in
this statement.

## 2. Before you import

- **INR must be an operating currency.** Check *Settings → Operating currencies*.
- **Create the accounts you will use** in the [Accounts view](/views/accounts/). Finzytrack
  never creates accounts or suggests their names; you choose each one from your own
  accounts:
  - an **Assets** account where the funds are held (for example, one per broker or
    distributor), and
  - an account for the **money paid in and out** (see step 4).
  - If the statement has dividends, redemptions or charges, it also asks for a dividend
    income account, a capital gains income account and a taxes account.
- **Try it on a copy first** if you like. Copy your ledger file, switch to the copy in
  *Settings*, import, and look at the result. You can also undo an import (step 7).

## 3. Read the statement

Open **Investments → Import statement**, choose the PDF, enter its password and click
**Read statement**. The password is used to open the file and is not saved.

Finzytrack shows what the statement covers, for example *"This statement covers
2010–2026: 17 years, 2,475 rows across 32 funds (7 still held)."*

## 4. Choose the accounts

- **Where the funds are held.** One row per distributor (ARN code) in the statement, or
  *Direct plans*. You can pick the same account for all of them.
- **Money paid in and out.** The statement shows the fund side only: it doesn't say
  which bank account paid for a purchase or received a redemption. You have three choices,
  and you can combine them:
  - **One account for everything (simplest).** Create one **Equity** account for money
    that moves between the outside world and your investments, and pick it here. Your
    history and returns are exact, and your bank accounts are not changed. From then on,
    when you import bank statements, categorise transfers to your funds to the same
    account.
  - **Match with bank transactions.** If your bank imports already put these payments in a
    **transfer account**, pick it under *Match with bank transactions in*. Each statement
    amount (a purchase plus its stamp duty) is matched with a bank transaction of the same
    amount within 7 days (you can change the number of days). The rest goes to the first
    account. The preview shows how many were matched, and any bank transactions in that
    account that matched nothing.
  - **A different account before a date.** Use this when your ledger starts later than
    the statement: before the date, one account; after it, the others.
- **Import history from (optional).** Leave it empty to import the full history. With a
  date, earlier transactions are not imported: what you held on that date is entered once,
  with each purchase's real date and cost. Note that returns from that date then count
  those holdings as money put in at cost on that date.
- **Write to file.** If your ledger is split into several files with `include`, you can
  choose the file the import goes to. See [Multi-file ledgers](/reference/multi-file-ledgers/).

If your ledger already has transactions you entered yourself for one of these funds (for
example with **Add Holding**), choose for that fund: **replace them** with the statement's
history, or **keep them** and import only what comes after them. Otherwise the units would
be counted twice.

## 5. Check the preview

The preview updates every time you change a choice. Nothing is written yet.

- **Funds you hold come first.** Funds you sold completely are grouped below them.
- **Each fund shows a ✓** when the units in your ledger after the import equal the
  statement's closing units.
- **Commodity code.** A new fund gets a short code made from its name, for example
  `HDFC-BALANCEDADV-RG`. You can change it. A fund you already have in your ledger (same
  ISIN or AMFI code) keeps its code. New funds get their name, ISIN, fund house, asset class
  and AMFI price symbol.
- **Don't import** leaves a fund out, for example a fund that belongs to someone else.
  Nothing is written for it: no transactions, balance check or price. If money was
  switched between it and one of your funds, your half is recorded against your cash-side
  account, and the preview says so. The choice applies to this import only.
- **Details** shows a fund's rows by year. Each year shows the units at year end and
  whether they match the statement, so a gap is pinned to the year it starts.
- **Messages** list anything to check: a switch whose other half wasn't found, a row that
  can't be imported, a fund that doesn't add up.

### How rows are read

| Statement shows | Recorded as |
|---|---|
| Purchase, SIP | A purchase at cost, paid from the cash side |
| Redemption | A sale: the oldest units go first (FIFO), with the gain |
| Switch or STP between two funds | One transaction: the sale of one fund and the purchase of the other |
| Dividend reinvested, or a dividend moved from another fund | Dividend income that buys units |
| Dividend paid out | Dividend income paid to the cash side |
| Merger, face value change | The new units keep each purchase's date and cost; no gain |
| Stamp duty, STT, TDS | Your taxes account, on the transaction they belong to |
| A purchase cancelled later (reversal) | Left out, together with the purchase |
| Address changes, nominee updates and other notes | Not imported |

Rows the statement doesn't explain are never guessed. They are listed and left out, and the
fund's units show the difference.

### Fix a row

If a row was read wrongly, open the fund's **Details**, find the row and click **Fix**.
You can:

- read it as something else (for example, a purchase that was really a dividend moved in
  from another fund),
- pair it with the other half of a switch or merger, or keep it unpaired,
- change its date, units or amount, or
- exclude it.

The preview is recalculated at once, including the year-end checks and the cost of later
sales. **Undo my changes** puts the row back as it was read.

## 6. Register

When nothing blocks the import, click **Register**. Everything is written in one step:

- the funds (commodities) and their details,
- the transactions,
- one balance check per fund, dated the day after the statement ends, so your ledger
  shows a warning if a later edit breaks the numbers,
- the price of each fund on the statement date, so it has a value at once.

Then click **Update prices** to fetch every fund's daily price history from your first
purchase, and open **Holdings & Performance**. Units and cost should match your broker;
gain and return are often defined differently, see
[Comparing with a broker's figures](/reference/investments/#comparing-with-a-brokers-figures).

## 7. Later: import again, or undo

- **Import a newer statement the same way.** Transactions already in your ledger are
  recognised and skipped, so the periods can overlap. Request a statement that starts on or
  before the end of your last one; Finzytrack warns you if there is a gap. An import only
  adds: it never changes or removes what is already in your ledger.
- **Your choices are remembered.** The accounts you picked last time are selected again.
- **Undo an import** under *Earlier imports*: it removes that import's transactions and
  balance checks. Funds and prices stay. A backup of your ledger is kept.
