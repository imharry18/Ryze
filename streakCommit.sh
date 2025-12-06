#!/bin/bash

MAX_DAYS=30      # How many days back to fill
declare -A summary   # To store commit counts per day

# Generate random time between 05:00-18:00
random_time() {
    hour=$((RANDOM % 14 + 5))
    minute=$((RANDOM % 60))
    second=$((RANDOM % 60))
    printf "%02d:%02d:%02d" "$hour" "$minute" "$second"
}

# Get commit count for today
get_commits_today() {
    git log --since=midnight --oneline | wc -l
}

# Get commit count for any date
get_commits_on_date() {
    git log --since="$1 00:00" --until="$1 23:59" --oneline | wc -l
}

echo "🔍 Checking today's commits..."
today_commits=$(get_commits_today)
target=$((RANDOM % 3 + 1))

echo "📅 Today: $today_commits commits / Required: $target"

while [ "$today_commits" -lt "$target" ]; do
    read -p "✍ Commit message for TODAY: " msg

    time=$(random_time)
    git add .
    git commit --date="$(date +%Y-%m-%d) $time" -m "$msg"

    today_commits=$((today_commits+1))
    summary["$(date +%Y-%m-%d)"]=$((summary["$(date +%Y-%m-%d)"]+1))

    echo "✔ Commit added → Today @ $time"
done
echo "🎉 Today's goal completed!"

# Backfill past days
for ((i=1; i<=MAX_DAYS; i++)); do
    date=$(date -d "$i days ago" +%Y-%m-%d)
    count=$(get_commits_on_date "$date")

    if [ "$count" -eq "0" ]; then
        numCommits=$((RANDOM % 3 + 1))
        echo "📅 $date → No commits, creating $numCommits commits"

        for ((c=1; c<=numCommits; c++)); do
            read -p "✍ Commit message for $date (commit $c/$numCommits): " msg
            time=$(random_time)

            git add .
            git commit --date="$date $time" -m "$msg"
            summary["$date"]=$((summary["$date"]+1))

            echo "✔ Commit added → $date @ $time"
        done
    else
        echo "➡ $date already has commits ($count) — Skipping"
    fi
done

echo "🚀 Pushing commits to GitHub..."
git push origin main --force

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 COMMIT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━"

for day in "${!summary[@]}"; do
    echo "📅 $day → ${summary[$day]} commits"
done

echo "✨ Completed Successfully!"
