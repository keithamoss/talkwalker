import { Container, Grid, IconButton, InputAdornment, InputBase, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ErrorTwoToneIcon from '@material-ui/icons/ErrorTwoTone'
import SearchIcon from '@material-ui/icons/Search'
import axios from 'axios'
import Papa from 'papaparse'
import React, { Fragment } from 'react'
import { useDebounce } from 'use-debounce'
import { isDev } from '../shared/utils'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    marginTop: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
    marginLeft: theme.spacing(1.25),
    flex: 1,
  },
  gridContainer: {
    marginTop: 25,
  },
  grid: {
    width: '100%',
  },
}))

let wordsList: string | null = null
const readWordsFile = (resolve: Function, reject: Function) => {
  ;(async () => {
    try {
      const response = await axios.get(
        `${window.location.protocol}//${window.location.host}/english-words/words.txt`
      )
      wordsList = response.data
      resolve()
    } catch (error) {
      reject(error)
    }
  })()
}

const findMatchingWords = async (term: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (typeof term !== 'string' || term.length < 4) {
      return resolve([])
    }

    if (typeof wordsList === 'string') {
      const regex = new RegExp(
        `^${term.replace('*', '.{0,}').replace('?', '.{1}')}$`,
        'i'
      )
      const matchedWordsList: string[] = []

      Papa.parse(wordsList, {
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

export const Home: React.FC = () => {
  const classes = useStyles()

  const [searchTermRaw, setSearchTerm] = React.useState<string>(
    isDev() ? '' : ''
  )
  const [searchTerm] = useDebounce(searchTermRaw, 500)
  const [isWordsListLoaded, setIsWordsListLoaded] = React.useState<boolean>(
    false
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [wordList, setWordList] = React.useState<string[]>([])

  React.useEffect(() => {
    ;(async () => {
      if (searchTerm.length >= 4) {
        setIsLoading(true)
        setErrorMessage(null)

        try {
          setWordList(await findMatchingWords(searchTerm))
        } catch (error) {
          setErrorMessage(error.message)
        }

        setIsLoading(false)
      }
    })()
  }, [searchTerm])

  React.useEffect(() => {
    setIsLoading(true)
    ;(async () => {
      readWordsFile(
        () => {
          setIsWordsListLoaded(true)
          setIsLoading(false)
        },
        (error: Error) => {
          setErrorMessage(error.message)
        }
      )
    })()
  }, [])

  return (
    <Fragment>
      <Container component="main" maxWidth="sm">
        <div className={classes.root}>
          <Typography component="h1" variant="h1">
            <span role="img" aria-label="Magnifying glass tiled left">
              🔍
            </span>
          </Typography>
          <Grid container style={{ marginTop: 25 }}>
            <Grid item style={{ width: '100%' }}>
              <Paper
                component="form"
                className={classes.form}
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <InputBase
                  className={classes.input}
                  placeholder="Enter a TalkWalker word pattern (e.g. famil*)"
                  disabled={isWordsListLoaded === false}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value.length >= 4) {
                      setSearchTerm(event.target.value)
                    }
                  }}
                  inputProps={{
                    name: 'search',
                    enterkeyhint: 'search',
                    'aria-label': 'search term',
                    autoComplete: 'off',
                  }}
                  defaultValue={searchTerm}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        color="primary"
                        aria-label="submit search form"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Paper>
            </Grid>

            <Grid container className={classes.gridContainer}>
              <Grid item className={classes.grid}>
                {isLoading === true && <LinearProgress variant="query" />}

                {errorMessage !== null && (
                  <List aria-label="error message">
                    <ListItem>
                      <ListItemIcon>
                        <ErrorTwoToneIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary={errorMessage} />
                    </ListItem>
                  </List>
                )}

                {isLoading === false && errorMessage === null && (
                  <List aria-label="word list">
                    {searchTerm.length >= 4 && wordList.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No matching words found 😢" />
                      </ListItem>
                    )}

                    {wordList.length > 0 &&
                      wordList.map((word: string) => {
                        return (
                          <ListItem key={word}>
                            <ListItemText primary={word} />
                          </ListItem>
                        )
                      })}
                  </List>
                )}
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Container>
    </Fragment>
  )
}
