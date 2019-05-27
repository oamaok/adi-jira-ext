const COLUMN_IDS = ['34876', '34887']
const COLUMN_SELECTOR = `.ghx-column[data-column-id="${COLUMN_IDS.join('"], .ghx-column[data-column-id="')}"]`
const spinnerHtml = '<svg class="hax-spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>'

const flatten = (acc, arr) => acc.concat(arr)

function getReviewContainer(elem, issueId) {
  const containerId = `hax-reviews-container-${issueId}`
  const container = document.getElementById(containerId)
  if (container) return container
  const newElement = document.createElement('div')
  newElement.id = containerId
  newElement.classList.add('hax-reviews-container')
  return elem.appendChild(newElement)
}

async function fetchReviews(issueId) {
  document.querySelectorAll(`.ghx-issue[data-issue-id="${issueId}"] .ghx-issue-content`)
    .forEach((elem) => {
      getReviewContainer(elem, issueId).innerHTML = spinnerHtml
    })

  const json = await fetch(`https://tools.adidas-group.com/jira/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=stash&dataType=pullrequest&_=${new Date().getTime()}`).then(res => res.json())
  const reviewInfo = []
  json.detail.forEach(d => d.pullRequests.forEach((pr) => {
    const approves = pr.reviewers.filter(review => review.approved).length
    const prLink = `<a href="${pr.url}" onclick="window.open('${pr.url}', '_blank');">${pr.id}</a>`
    reviewInfo.push(`${prLink}: ${approves}${approves >= 2 ? ' ✅' : ''}`)
    document.querySelectorAll(`div.ghx-issue[data-issue-id="${issueId}"]`)
      .forEach(elem => elem.classList.toggle('approved', approves >= 2))
  }))
  document.querySelectorAll(`.ghx-issue[data-issue-id="${issueId}"] .ghx-issue-content`)
    .forEach((elem) => {
      getReviewContainer(elem, issueId).innerHTML = reviewInfo.join('<br>')
    })
}

new MutationObserver((mutList) => {
  mutList
    .filter(x => x.type === 'childList')
    .map(mutation => mutation.addedNodes)
    .reduce(flatten, [])
    .filter(node => node.querySelectorAll)
    .map(node => node.querySelectorAll(COLUMN_SELECTOR))
    .reduce(flatten, [])
    .map(col => col.querySelectorAll('.ghx-issue[data-issue-id]'))
    .reduce(flatten, [])
    .forEach((issue) => {
      const id = issue.getAttribute('data-issue-id')
      fetchReviews(id)
      issue.addEventListener('click', () => {
        fetchReviews(id)
      })
    })
}).observe(document, { subtree: true, childList: true })
