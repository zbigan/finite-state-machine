type State =
  | 'look_for_string'
  | 'in_string'
  | 'copy_next_char'

type Action =
  | 'start_new_string'
  | 'ignore'
  | 'add_current_to_string'
  | 'finish_current_string'

type ActionsImplementation = {
  [e: string]: [State, Action];
} & {
  default: [State, Action];
}

type TransitionsTable = Record<State, ActionsImplementation>

class FSM {
  transitionsTable: TransitionsTable
  currentState: State
  
  constructor(transitionsTable: TransitionsTable, initialState: State) {
    this.transitionsTable = transitionsTable
    this.currentState = initialState
  }

  accept(event: string) {
    const [state, action] =
      this.transitionsTable?.[this.currentState][event]
      ||
      this.transitionsTable[this.currentState]['default']!

    this.currentState = state

    return action
  }
}

const input = ["1", '"', "a", "c", "d", "e", "f", '"']

const transitionTable: TransitionsTable = {
  'look_for_string': {
    '"': ['in_string', 'start_new_string'],
    'default': ['look_for_string', 'ignore'],
  },
  'in_string': {
    '"': ['look_for_string', 'finish_current_string'],
    '\\': ['copy_next_char', 'add_current_to_string'],
    'default': ['in_string', 'add_current_to_string'],
  },
  'copy_next_char': {
    'default': ['in_string', 'add_current_to_string'],
  },
}

const readerFsm = new FSM(transitionTable, 'look_for_string')

let result: string[] = []

while (input.length) {
  const char = input.shift()!
  const action = readerFsm.accept(char)

  switch (action) {
    case 'ignore': {
      break
    }
    case 'start_new_string': {
      result = []
      break
    }
    case 'add_current_to_string': {
      result.push(char)
      break
    }
    case 'finish_current_string': {
      console.log(result.join(''))
      break
    }
    default:
      break
  }
}
