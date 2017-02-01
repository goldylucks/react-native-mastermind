import React, { Component } from 'react'
import { View, Text, TouchableWithoutFeedback } from 'react-native'

const COLORS = ['blue', 'purple', 'red', 'green', 'yellow', 'orange']

export default class App extends Component {

  state = {
    solution: this.randomizeSolution(),
    guessCount: 0,
    guessingOpen: false,
    activePickerIdx: -1, // mimic no active picker
    guesses: [],
    completed: false,
  }

  render () {
    return (
      <View style={ styles.container }>
        { this.renderRows() }
        { this.renderPickMenu() }
      </View>
    )
  }

  renderRows () {
    return [...Array(12)].map((x, row) => (
      <View style={ styles.row } key={ row }>
        <TouchableWithoutFeedback onPress={ () => this.onPickerPress(row, 0) }>
          <View style={ [styles.picker, { backgroundColor: this.getPickerColor(row, 0) }] } />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={ () => this.onPickerPress(row, 1) }>
          <View style={ [styles.picker, { backgroundColor: this.getPickerColor(row, 1) }] } />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={ () => this.onPickerPress(row, 2) }>
          <View style={ [styles.picker, { backgroundColor: this.getPickerColor(row, 2) }] } />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={ () => this.onPickerPress(row, 3) }>
          <View style={ [styles.picker, { backgroundColor: this.getPickerColor(row, 3) }] } />
        </TouchableWithoutFeedback>
        <View style={ styles.divider } />
        { this.renderStats(row) }
        { this.renderCheckButton(row) }
      </View>
    ))
  }

  renderStats (row) {
    if (row === this.state.guessCount) {
      return
    }
    return (
      <View style={ styles.stats }>
        <View style={ styles.statsRow }>
          <View style={ [styles.stat, { backgroundColor: this.getStatColor(row, 0) }] } />
          <View style={ [styles.stat, { backgroundColor: this.getStatColor(row, 1) }] } />
        </View>
        <View style={ styles.statsRow }>
          <View style={ [styles.stat, { backgroundColor: this.getStatColor(row, 2) }] } />
          <View style={ [styles.stat, { backgroundColor: this.getStatColor(row, 3) }] } />
        </View>
      </View>
    )
  }

  renderCheckButton (row) {
    if (row !== this.state.guessCount) {
      return
    }
    return (
      <TouchableWithoutFeedback onPress={ this.check } style={ styles.checkButton }>
        <View>
          <Text>Check</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderPickMenu () {
    if (!this.state.guessingOpen) {
      return
    }
    return (
      <View style={ styles.pickMenu }>
        {
          COLORS.map(color => (
            <TouchableWithoutFeedback onPress={ () => this.guess(color) } key={ color }>
              <View style={ [styles.pickMenuItem, { backgroundColor: color }] } />
            </TouchableWithoutFeedback>
          ))
        }
      </View>
    )
  }

  getPickerColor (row, pickerIdx) {
    const thisRowGuesses = this.state.guesses[row]
    return thisRowGuesses && thisRowGuesses[pickerIdx]
  }

  getStatColor (row, pickerIdx) {
    if (row >= this.state.guessCount) {
      return
    }
    const { perfect, loose } = this.getMatches(row, pickerIdx)
    if (perfect > pickerIdx) {
      return 'black'
    }
    if (perfect + loose > pickerIdx) {
      return 'red'
    }
  }

  getMatches (row, pickerIdx) {
    const matches = {
      perfect: 0,
      loose: 0,
    }
    const solution = this.state.solution.slice()
    this.state.guesses[row].forEach((color, idx) => {
      if (solution[idx] === color) {
        matches.perfect += 1
        solution[idx] = 'processed' // avoid double counting for loose matches later
      }
    })
    this.state.guesses[row].forEach((color, idx) => {
      if (solution[idx] === 'processed') {
        return
      }
      const looseMatchIdx = solution.indexOf(color)
      if (looseMatchIdx > -1) {
        matches.loose += 1
        solution[idx] = 'processed'
      }
    })
    return matches
  }

  randomizeSolution () {
    return [...Array(4)].map(this.randomColor)
  }

  randomColor () {
    return COLORS[Math.floor(Math.random() * 6)]
  }

  onPickerPress (row, pickerIdx) {
    if (this.state.guessingOpen) {
      return
    }
    this.setState({
      guessingOpen: true,
      activePickerIdx: pickerIdx,
    })
  }

  check = () => {
    if (!this.roundComplete()) {
      global.alert('fill all guesses please!')
      return
    }
    if (this.state.completed) {
      global.alert('game is over! maybe play another one?')
      return
    }

    this.setState(state => {
      return {
        guessCount: state.guessCount + 1,
        completed: state.guessCount + 1 === 12 || this.hasWon(state),
      }
    })
  }

  hasWon ({ guesses, guessCount, solution }) {
    return guesses[guessCount].every((guess, idx) => guess === solution[idx])
  }

  guess = color => {
    this.setState(state => {
      state.guesses[state.guessCount] = state.guesses[state.guessCount] || []
      state.guesses[state.guessCount][state.activePickerIdx] = color
      return {
        guessingOpen: false,
        activePickerIdx: -1,
        guesses: state.guesses,
      }
    })
  }

  roundComplete () {
    const { guesses, guessCount } = this.state
    return guesses[guessCount] && guesses[guessCount].filter(i => i).length === 4
  }
}

const PICKER_DIMENSION = 40
const STAT_DIMENSION = 10

const styles = {
  container: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  picker: {
    width: PICKER_DIMENSION,
    height: PICKER_DIMENSION,
    marginRight: 10,
    borderRadius: PICKER_DIMENSION / 2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333',
  },

  divider: {
    width: 1,
    height: PICKER_DIMENSION * 1.2,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },

  checkButton: {
    width: 50,
    padding: 10,
  },

  stats: {
    width: 50,
    padding: 10,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  stat: {
    width: STAT_DIMENSION,
    height: STAT_DIMENSION,
    borderRadius: STAT_DIMENSION / 2,
    marginRight: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333',
  },

  pickMenu: {
    position: 'absolute',
    justifyContent: 'center',
    width: 120,
    paddingTop: 10,
    paddingBottom: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    top: 0,
    left: 0,
    // padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333',
  },

  pickMenuItem: {
    height: 25,
    width: 25,
    margin: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#333',
  },

}
