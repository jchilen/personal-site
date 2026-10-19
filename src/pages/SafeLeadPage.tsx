import CategoryBar from '../components/CategoryBar'

function SafeLeadPage() {
  return (
    <>
      <CategoryBar floating />
        <section className="tool-page">
            <p className="eyebrow">Tools</p>
            <h1>CBB: Is the Lead Safe?</h1>
            <p className="tool-intro">
                Find out if a college basketball game is effectively over.
            </p>

            <div className="safe-lead">
                <div className="safe-lead-panel safe-lead-inputs">
                    Inputs go here
                </div>
                <div className="safe-lead-panel safe-lead-result">
                    Result goes here
                </div>
            </div>

            <p className="tool-credit">
                Uses the{' '}
                <a
                    href="https://www.slate.com/articles/sports/sports_nut/2008/03/the_lead_is_safe.single.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                Safe Lead Formula
                </a>{' '}
                created by Bill James.
            </p>
    </section>
    </>
  )
}

export default SafeLeadPage