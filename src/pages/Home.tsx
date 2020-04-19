import { Container, Grid, IconButton, InputAdornment, InputBase, LinearProgress, List, ListItem, ListItemText, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import SearchIcon from '@material-ui/icons/Search'
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

const findMatchingWords = async (term: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (typeof term !== 'string' || term.length < 4) {
      return resolve([])
    }

    const regex = new RegExp(
      `^${term.replace('*', '.{0,}').replace('?', '.{1}')}$`,
      'i'
    )
    const wordList: string[] = []

    Papa.parse(
      // The worker needs a fully qualified URL
      `${window.location.protocol}//${window.location.host}/english-words/words.txt`,
      {
        download: true,
        worker: true,
        step: (results: any) => {
          const [word] = results.data
          if (regex.test(word) === true) {
            wordList.push(word)
          }
        },
        complete: () => {
          resolve(wordList)
        },
        error: (error: any) => {
          reject(error)
        },
      }
    )
  })
}

export const Home: React.FC = () => {
  const classes = useStyles()

  const [searchTermRaw, setSearchTerm] = React.useState<string>(
    isDev() ? '' : ''
  )
  const [searchTerm] = useDebounce(searchTermRaw, 500)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [wordList, setWordList] = React.useState<string[]>([])

  React.useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setWordList(await findMatchingWords(searchTerm))
      setIsLoading(false)
    })()
  }, [searchTerm])

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

                  // const form = e.target as HTMLFormElement
                  // const input: HTMLInputElement | null = form.elements.namedItem(
                  //   'search'
                  // ) as HTMLInputElement
                  // if (input !== null && input.value.length > 0) {
                  //   setSearchTerm(input.value)
                  // }
                }}
              >
                <InputBase
                  className={classes.input}
                  placeholder="Enter a TalkWalker word pattern (e.g. famil*)"
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

                {isLoading === false && (
                  <List component="nav" aria-label="word list">
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
