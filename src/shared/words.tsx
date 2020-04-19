import axios from 'axios'
import Papa from 'papaparse'

export const readWordsFile = (resolve: Function, reject: Function) => {
  ;(async () => {
    try {
      const response = await axios.get(
        `${window.location.protocol}//${window.location.host}/english-words/words.txt`
      )
      window.wordsList = response.data
      resolve()
    } catch (error) {
      reject(error)
    }
  })()
}

export const findMatchingWords = async (term: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (typeof term !== 'string' || term.length < 4) {
      return resolve([])
    }

    if (typeof window.wordsList === 'string') {
      const regex = new RegExp(
        `^${term.replace('*', '.{0,}').replace('?', '.{1}')}$`,
        'i'
      )
      const matchedWordsList: string[] = []

      Papa.parse(window.wordsList, {
        worker: true,
        fastMode: true,
        step: (results: any) => {
          const [word] = results.data
          if (regex.test(word) === true) {
            matchedWordsList.push(word)
          }
        },
        complete: () => {
          resolve(matchedWordsList)
        },
        error: (error: any) => {
          reject(error)
        },
      })
    }
  })
}
