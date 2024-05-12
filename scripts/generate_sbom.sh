#!/bin/bash

# Generate SBOM by scanning through frontend and backend dependencies. Write it out to yml file

# Function to extract dependencies from requirements.txt
extract_python_dependencies() {
    echo "backend:"
    echo "  python:"
    while IFS= read -r line; do
        if [[ $line =~ ^\s*# || ! $line =~ [^[:space:]] ]]; then
            continue
        fi
        name=$(echo "$line" | awk -F '==' '{print $1}')
        version=$(echo "$line" | awk -F '==' '{print $2}')
        echo "    - name: $name"
        echo "      version: $version"
    done < "${CS30_DIR}/api/requirements.txt"
}

# Function to extract dependencies from package.json
extract_frontend_dependencies() {
    echo "frontend:"
    echo "  react:"
    dependencies=$(jq -r '.dependencies // {} | to_entries[] | "\(.key)@\(.value)"' "${CS30_DIR}/frontend/package.json")
    while IFS= read -r dep; do
        if [[ $dep == @* ]]; then
            name=$(echo "$dep" | cut -d'@' -f2)
            version=$(echo "$dep" | cut -d'@' -f3)
        else
            name=$(echo "$dep" | cut -d'@' -f1)
            version=$(echo "$dep" | cut -d'@' -f2)
        fi
        echo "    - name: $name"
        echo "      version: $version"
    done <<< "$dependencies"
}

# Main function to generate SBOM
generate_sbom() {
    echo "project_name: CS30 Podcast Editor"
    echo "version: 1.0.0"
    echo "description: A list of dependencies used in CS30 Podcast Editor frontend and API"
    extract_python_dependencies
    extract_frontend_dependencies
}

generate_sbom > sbom.yml  # Redirect output to sbom.yml
