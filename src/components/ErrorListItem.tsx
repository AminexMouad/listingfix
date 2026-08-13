import { Link } from 'react-router-dom'
import type { AmazonError } from '../lib/errors'
import { SEVERITY_LABEL } from '../lib/errors'

export default function ErrorListItem({ error }: { error: AmazonError }) {
  return (
    <li>
      <Link className="code-item" to={`/amazon-error/${error.code}`}>
        <span className="code-badge">{error.code}</span>
        <span className="code-item-body">
          <strong>{error.title}</strong>
          <span>{error.cause}</span>
        </span>
        <span className={`pill pill-${error.severity}`}>{SEVERITY_LABEL[error.severity]}</span>
      </Link>
    </li>
  )
}
