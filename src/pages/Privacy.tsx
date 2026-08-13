import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/site'

export default function Privacy() {
  useSeo({
    title: `Privacy, Disclaimer & How It Works | ${SITE.name}`,
    description: `How ${SITE.name} handles your data: everything runs client-side in your browser, no files are uploaded, no account is required. Includes the trademark disclaimer and accuracy notes.`,
    path: '/privacy',
  })

  return (
    <div className="wrap wrap-narrow page">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / Privacy &amp; how it works
      </p>

      <h1>Privacy, disclaimer and how it works</h1>
      <p className="muted">Short version: your files stay on your computer.</p>

      <section className="section">
        <h2>How the tools process your data</h2>
        <p>
          Both tools are ordinary JavaScript running inside your browser tab. When you paste CSV text
          or open a <code>.csv</code> file, the file is read with the browser's local File API and
          parsed in memory. The converted output is generated in the same tab and handed to you as a
          download or a clipboard copy.
        </p>
        <p>
          There is no backend, no API call, no upload endpoint and no database. If you disconnect
          from the internet after the page loads, both tools keep working. Closing the tab discards
          everything.
        </p>
      </section>

      <section className="section">
        <h2>What is stored</h2>
        <ul>
          <li>
            <strong>Your product data:</strong> nothing. It lives in page memory only, for as long as
            the tab is open.
          </li>
          <li>
            <strong>Accounts:</strong> none. There is no sign-up, no login and no email collection.
          </li>
          <li>
            <strong>Analytics:</strong> the site loads Google Analytics 4 to count page views and see
            which error codes people look up. That collects standard web analytics data (page URL,
            referrer, approximate location, device type). It does not receive the contents of your
            CSV files or anything you paste into the tools.
          </li>
          <li>
            <strong>Cookies:</strong> only the ones Google Analytics sets. The tools themselves set
            no cookies.
          </li>
        </ul>
        <p className="small muted">
          If you would rather not be counted, any content blocker or your browser's Do Not Track /
          tracking-protection setting will block the analytics script. The tools work exactly the
          same with it blocked.
        </p>
      </section>

      <section className="section">
        <h2>Accuracy and limitations</h2>
        <ul>
          <li>
            Error-code explanations are practitioner interpretations, not official Amazon
            documentation. Amazon changes validation behaviour without notice.
          </li>
          <li>
            Column schemas are compiled from public documentation and real export files. Amazon's
            category templates in particular vary per category — always start from a freshly
            downloaded template.
          </li>
          <li>
            The converter renames and reshapes columns. It cannot invent category IDs, product types
            or category-specific required attributes; those still need your judgement.
          </li>
          <li>
            Always keep a backup of your original file, and test a small batch before uploading
            thousands of rows.
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>Trademark disclaimer</h2>
        <p>
          {SITE.name} is an independent tool. It is not affiliated with, endorsed by, sponsored by or
          in any way officially connected to Amazon.com, Inc., eBay Inc., Etsy, Inc., Shopify Inc. or
          Automattic / WooCommerce. All product names, logos and brands are the property of their
          respective owners and are used here only to identify the file formats those platforms
          publish.
        </p>
      </section>

      <section className="section">
        <h2>No warranty</h2>
        <p>
          The tools are provided free and as-is, without warranty of any kind. You are responsible
          for what you upload to a marketplace. Verify converted files and error fixes against the
          official platform documentation before acting on them.
        </p>
      </section>
    </div>
  )
}
