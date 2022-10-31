function toPerc(f) {
    return Math.round(f*1000)/10
}

export default function objectToCSV(data) {
    const csv = data.reduce((row,p,i) => {
        if(i === 0) row += 'id,player_name,leagues,md,odds,xG,variance,variability_sd,variability %,absolute_variability\n'
        const leagues = p.leagues.sort().join(',')
        row += p.id + ',' + p.player_name + ',' + '\"' + leagues + '\"' + ',' + p.scores.md + ','
            + p.scores.odds + ',' + p.scores['xG'] + ',' + p.scores.variance + ','
            + p.scores.variability.sd + ',' + toPerc(p.scores.variability.perc) + ',' + p.scores.variability.abs_sd + '\n'
        return row
    },'')
    return csv
}