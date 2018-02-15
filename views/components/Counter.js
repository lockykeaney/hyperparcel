import { h } from 'hyperapp'
import picostyle from "picostyle"
const style = picostyle(h)

const Wrapper = style('div')({
    height: 'auto',
    width: '50px',
    textAlign: 'center',
    backgroundColor: 'plum',
    margin: '0 auto'
})

const Button = style('button')({
    backgroundColor: 'blue'
})

const actions = {
    down: value => state => ({ count: state.count - value }),
    up: value => state => ({ count: state.count + value })
}

export const Counter = ({ count }) => (
    <Wrapper>
        <h1>{count}</h1>
        <Button onclick={() => actions.down(1)}>-</Button>
        <Button onclick={() => actions.up(1)}>+</Button>
    </Wrapper>
)