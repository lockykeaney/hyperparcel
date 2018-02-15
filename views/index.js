import { h, app } from 'hyperapp'

import { Counter } from './components/Counter'
import { String } from './components/String'
import { Git } from './components/Git'

export const view = (state, actions) => (
    <div>
        {/* <Git 
            gitUser={state.git}
            gitActions={actions.git}
        /> */}
        <Counter 
            count={state.counter.count} 
            // counter={actions.counter}
        />
    </div>
)

