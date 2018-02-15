import { h } from 'hyperapp'

export const String = ({ state, actions }) => (
    <div>
        <h1>{state}</h1>
        <button 
            onclick={() => actions.updateString('Goodbye World')}>
            Button
        </button>
    </div>
)