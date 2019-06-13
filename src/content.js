import {
  flatten, filter, pipe, propEq, pluck, map, forEach, chain, prop,
} from 'ramda'

const COLUMN_IDS = ['34876', '34887']
const REVIEWS_REQUIRED = 2

const spinnerElement = document.createElement('svg')
spinnerElement.setAttribute('class', 'hax-spinner')
spinnerElement.setAttribute('viewBox', '0 0 50 50')
spinnerElement.innerHTML = '<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>'

const fetchIssue = issueId => fetch(`https://tools.adidas-group.com/jira/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=stash&dataType=pullrequest&_=${new Date().getTime()}`).then(res => res.json())

const clearElement = element => [...element.children].forEach(element.removeChild.bind(element))

const setElementContents = element => (children) => {
  clearElement(element)
  children.forEach(element.appendChild.bind(element))
}

const getApprovals = pr => pr.reviewers.filter(review => review.approved).length
const isApproved = pr => getApprovals(pr) >= REVIEWS_REQUIRED

const createFetchReviews = (issue) => {
  const issueId = issue.getAttribute('data-issue-id')
  const customContainer = document.createElement('div')

  const issueContent = issue.querySelector('.ghx-issue-content')
  issueContent.appendChild(customContainer)

  return async function fetchReviews() {
    setElementContents(customContainer)([spinnerElement])

    const issueData = await fetchIssue(issueId)
    const pullRequests = chain(prop('pullRequests'), issueData.detail)

    issue.classList.toggle('approved', pullRequests.some(isApproved))

    const links = pullRequests.map((pr) => {
      const approvals = getApprovals(pr)
      const text = document.createTextNode(`: ${approvals}${isApproved(pr) ? ' ✅' : ''}`)

      const linkToPR = document.createElement('a')
      linkToPR.href = pr.url
      linkToPR.target = '_blank'
      linkToPR.innerText = pr.id

      const prContainer = document.createElement('span')
      setElementContents(prContainer)([linkToPR, text])

      return prContainer
    })

    setElementContents(customContainer)(links)
  }
}

new MutationObserver(pipe(
  filter(propEq('type', 'childList')),
  pluck('addedNodes'),
  flatten,
  filter(prop('querySelectorAll')),
  map(node => COLUMN_IDS.map(
    col => node.querySelectorAll(`[data-column-id="${col}"] .ghx-issue`),
  )),
  flatten,
  forEach((issue) => {
    const fetchReviews = createFetchReviews(issue)
    fetchReviews()
    issue.addEventListener('click', fetchReviews)
  }),
)).observe(document, { subtree: true, childList: true })
