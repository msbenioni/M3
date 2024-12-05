const validateRole = (role) => {
    if (!role || typeof role !== 'string') {
        throw new Error('Role is required and must be a string.');
    }
};

const validateQuestionCount = (count) => {
    if (count < 0 || count > 10) {
        throw new Error('Question count must be between 0 and 10.');
    }
};

const validateResponses = (responses) => {
    if (!Array.isArray(responses) || responses.length === 0) {
        throw new Error('Responses must be a non-empty array.');
    }
    if (!responses.every(r => r.role && r.content)) {
        throw new Error('Invalid response format.');
    }
};

const generatePrompt = (role, userResponse, questionCount, basePrompt) => {
    if (!userResponse) {
        return `
            ${basePrompt}
            You are a senior professional conducting an interview for the role of ${role}.
            Begin with a warm introduction and set the tone for a thoughtful interview.
        `;
    }

    return `
        ${basePrompt}
        You are interviewing for the role of ${role}.
        Question ${questionCount + 1} of 6. 
        The candidate said: "${userResponse}"
        Provide constructive feedback and ask the next thoughtful question.
    `;
};

module.exports = {
    validateRole,
    validateQuestionCount,
    validateResponses,
    generatePrompt,
};
