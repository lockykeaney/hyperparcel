import { counter } from './counter.js'
import { git } from './git.js'

export const actions = {
    updateString: (value) => state => ({ string: value }),
    counter,
    git
}