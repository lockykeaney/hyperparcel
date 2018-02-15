import { h } from 'hyperapp'

export const Git = ({ gitUser, gitActions }) => (
    <div>
        Enter a github username to find the number of repos
        <p>{gitUser.username}</p>
        <p>{gitUser.returned}</p>
        <input 
            type="text" 
            placeholder="username"
            oninput={(e) => gitActions.searchValue(e.target.value)}
        />
        <button 
            onclick={() => gitActions.submitSearch(gitUser.username) }>
            Search
        </button>
    </div>
)