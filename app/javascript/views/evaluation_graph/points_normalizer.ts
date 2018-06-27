// For taking raw analysis data and updating the polarity
// of the points to graph correctly

import * as _ from 'underscore'
import Chess from 'chess.js'

import { chess } from '../../chess_mechanism'
import analysisCache from '../../analysis_cache'

const getGameOverScore = (fen): number => {
  const c = new Chess(fen)
  if (c.in_stalemate()) {
    return 0
  } else if (c.in_checkmate()) {
    if (c.turn() === "w") {
      return -10
    } else {
      return 10
    }
  }
  return 0
}

const getNormalizedScore = (fen): number => {
  let polarity = /\sw\s/.test(fen) ? 1 : -1
  polarity *= chess.get("polarity")
  const analysis = analysisCache.get(fen)
  if (!analysis || !analysis.variations[0]) {
    return 0
  }
  let score = analysis.variations[0].score
  if (!score) {
    return getGameOverScore(fen)
  }
  if (score < -10) {
    score = -10
  } else if (score > 10) {
    score = 10
  }
  if (_.isString(score) && score.match(/^mate/)) {
    let m = +score.split(" ")[1]
    if (m === 0) {
      score = getGameOverScore(fen)
    } else {
      score = 10
      score *= (m > 0 ? 1 : -1)
      score *= polarity
    }
  } else {
    score *= polarity
  }
  return score
}

export const getNormalizedScores = (fenArray: Array<string>): Array<number> => {
  return fenArray.map(fen => getNormalizedScore(fen))
}
