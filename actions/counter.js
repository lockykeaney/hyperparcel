export const counter = {
    down: value => state => ({ count: state.count - value }),
    up: value => state => ({ count: state.count + value })
}