export const git = {
    searchValue: value => state => ({ username: value}),
    updateRepos: value => state => ({ returned: value}),
    submitSearch: value => state => (
        fetch(`https://api.github.com/users/${value}`)
            .then(response => response.json())
            .then(response => console.log(response.public_repos))
            .then(response => git.updateRepos(response))
    )
}