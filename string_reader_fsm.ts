import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';


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

if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

const filename = process.argv[2]

await pipeline(
  fs.readFileSync(filename, { encoding: 'utf8' }),
  async function* processChunks(readable) {
    for await (const chunk of readable) {
      const action = readerFsm.accept(chunk)
      
      switch (action) {
        case 'ignore': {
          break
        }
        case 'start_new_string': {
          break
        }
        case 'add_current_to_string': {
          yield chunk
          break
        }
        case 'finish_current_string': {
          console.log('finished string!')
          break
        }
        default:
          break
      }
    }
  },
  fs.createWriteStream('output.txt')
)
