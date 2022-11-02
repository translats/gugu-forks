const axios = require('axios')

const ORG_NAME = 'buiawpkgew1'
const TOKEN = process.env.ACCESS_TOKEN
const PER_PAGE = 50

axios.defaults.baseURL = 'https://api.github.com'
axios.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`

/**
 * 获取仓库的所有
 * @returns {Promise<string[]>} 仓库列表
 */
async function getRepos() {
    let repos = []
    let page = 1
    let errTimes = 0
    let nextQuery = true
    while (nextQuery) {
        // 获取所有仓库
        try {
            const response = await axios.get(`/orgs/${ORG_NAME}/repos`, {
                params: {
                    page: page,
                    per_page: PER_PAGE,
                    type: 'forks'
                }
            })
            let len = response.data.length
            if (len < PER_PAGE) {
                nextQuery = false
            }

            response.data.forEach((repo) => {
                repos.push(repo.name)
            })

            page++
        } catch (err) {
            errTimes++
            if (errTimes >= 3) {
                console.log('错误次数过多, 停止')
                nextQuery = false
            }
        }

    }
    return repos
}


/**
 * 获取仓库状态
 * @param repo 仓库
 * @returns {Promise<int>} 仓库落后上游多少commit
 */
async function getStatus(repo) {
    try {
        const repoInfo = await axios.get(`/repos/${ORG_NAME}/${repo}`)
        const author = repoInfo.data.source.owner.login
        const forkBranch = repoInfo.data.default_branch
        const originalBranch = repoInfo.data.source.default_branch

        const compareData = await axios.get(`/repos/${ORG_NAME}/${repo}/compare/${forkBranch}...${author}:${originalBranch}`)
        return compareData.data.ahead_by
    } catch (err) {
        console.error(err)
    }
}

console.log('获取仓库列表...')
getRepos().then((repos) => {
    console.log('拥有', repos.length, '个fork仓库')
    repos.forEach((repo) => {
        getStatus(repo).then((diff) => {
            if (diff > 0) {
                console.log(repo, '需要合并上游的', diff, '个commit')
            }
        })
    })
})
