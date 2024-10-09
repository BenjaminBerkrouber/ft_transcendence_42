// ===========================================================================
// ==================== DEFAULT VALUES =======================================
// ===========================================================================

const defaultCustomValue = {
	custom_ball: {
		color: {
			type: 'color',
			value: '0xFFFFFF',
			target: 'colorValue',
		},
		colorValue: {
			type: 'none',
			value: '0xFFFFFF',
		},
		size: {
			type: 'range',
			min: 0.1,
			max: 2,
			step: 0.1,
			value: '0.5',
			target: 'size',
		},
		emissiveIntensity: {
			type: 'range',
			min: 0,
			max: 100,
			step: 1,
			value: '30',
			target: 'emissiveIntensity',
		},
		lightIntensity: {
			type: 'range',
			min: 0,
			max: 300,
			step: 1,
			value: '150',
			target: 'lightIntensity',
		},
		colorLight: {
			type: 'color',
			value: '0xFF0000',
			target: 'colorLightValue',
		},
		colorLightValue: {
			type: 'none',
			value: '0xFF0000',
		},
		accessory: {
			type: 'select',
			options: ['None', 'option1', 'option2'],
			value: null,
			target: 'accessory',
		},
	},
	custom_plateau: {
		fontColor: {
			type: 'color',
			value: '0xFF0000',
			target: 'fontColorValue',
		},
		fontColorValue: {
			type: 'none',
			value: '0xFF0000',
		},
		size: {
			type: 'range',
			min: 20,
			max: 60,
			step: 1,
			value: 41,
			target: 'size',
		},
		reflexion: {
			type: 'range',
			min: 0,
			max: 1,
			step: 0.01,
			value: 0,
			target: 'reflexion',
		},
		light: {
			type: 'range',
			min: 0,
			max: 500,
			step: 1,
			value: 0,
			target: 'light',
		},
		lightEmissive: {
			type: 'range',
			min: 0,
			max: 500,
			step: 1,
			value: 0,
			target: 'lightEmissive',
		},
		borderColor: {
			type: 'color',
			value: '0xFF0000',
			target: 'borderColorValue',
		},
		borderColorValue: {
			type: 'none',
			value: '0xFF0000',
		},
		limiteurColor: {
			type: 'color',
			value: '0xFF0000',
			target: 'limiteurColorValue',
		},
		limiteurColorValue: {
			type: 'none',
			value: '0xFF0000',
		},
	},
	custom_paddle: {
		color: {
			type: 'color',
			value: '0xFF0000',
		},
		lightColor: {
			type: 'color',
			value: '0xFF0000',
		},
		light: {
			type: 'range',
			min: 0,
			max: 10,
			step: 1,
			value: 0,
		},
		reflexion: {
			type: 'range',
			min: 0,
			max: 1,
			step: 0.1,
			value: 0,
		},
		size: {
			type: 'range',
			min: 1,
			max: 10,
			step: 0.1,
			value: 0,
		},
	},
	custom_map: {
		background: {
			type: 'file',
			value: null,
		},
	},
	custom_score: {
		color: {
			type: 'color',
			value: '0xFF0000',
		},
		light: {
			type: 'range',
			min: 0,
			max: 100,
			step: 1,
			value: 0,
		},
		font: {
			type: 'select',
			options: [null, 'Arial', 'Roboto', 'CustomFont'],
			value: null,
		},
	},
	custom_animation: {
		animation: {
			type: 'select',
			options: [null, 'Bounce', 'Slide', 'Fade'],
			value: null,
		},
	},
};


// ===========================================================================
// ==================== SERIALIZE ============================================
// ===========================================================================


async function serializeCustomGame(game) {
	try {
		return {
			custom_ball: await serializeCustomBall((game && game.Customball) ? game.Customball : null),
			custom_plateau: await serializeCustomPlateau((game && game.CustomPlateau) ? game.CustomPlateau : null),
			custom_paddle: await serializeCustomPaddle((game && game.CustomPaddle) ? game.CustomPaddle : null),
			custom_map: await serializeCustomMap((game && game.CustomMap) ? game.CustomMap : null),
			custom_score: await serializeCustomScore((game && game.CustomScore) ? game.CustomScore : null),
			custom_animation: await serializeCustomAnimation((game && game.CustomAnimation) ? game.CustomAnimation : null),
		};
	} catch (e) {
		console.error(`error in serializeCustomGame' ${e}`);
	}
}

async function serializeCustomBall(customBall) {
	try {
		return {
			color: ((customBall && customBall.color) ? customBall.color : defaultCustomValue.custom_ball.color.value),
			
			colorValue: ((customBall && customBall.colorValue) ? customBall.colorValue : defaultCustomValue.custom_ball.colorValue.value),
			
			size: ((customBall && customBall.radius) ? customBall.radius : defaultCustomValue.custom_ball.size.value),
			
			emissiveIntensity: ((customBall && customBall.intensity) ? customBall.intensity : defaultCustomValue.custom_ball.emissiveIntensity.value),
			
			lightIntensity: ((customBall && customBall.light.intensity) ? customBall.light.intensity : defaultCustomValue.custom_ball.lightIntensity.value),
			
			colorLight: ((customBall && customBall.light.color) ? customBall.light.color : defaultCustomValue.custom_ball.colorLight.value),
			
			colorLightValue: ((customBall && customBall.colorLightValue) ? customBall.colorLightValue : defaultCustomValue.custom_ball.colorLightValue.value),
			
			accessory: ((customBall && customBall.option) ? customBall.option : defaultCustomValue.custom_ball.accessory.value),
		};
	} catch (e) {
		console.error(`error in serializeCustomBall ${e}`)
	}
}

async function serializeCustomPlateau(CustomPlateau) {
	try {
		return {
			fontColor: ((CustomPlateau && CustomPlateau.plateau_data.color) ? CustomPlateau.plateau_data.color : defaultCustomValue.custom_plateau.fontColor.value),
			
			fontColorValue: ((CustomPlateau && CustomPlateau.fontColorValue) ? CustomPlateau.fontColorValue : defaultCustomValue.custom_plateau.fontColorValue.value),
			
			size: ((CustomPlateau && CustomPlateau.radius) ? CustomPlateau.radius : defaultCustomValue.custom_plateau.size.value),
			
			reflexion: ((CustomPlateau && CustomPlateau.plateau_data.opacity) ? CustomPlateau.plateau_data.opacity : defaultCustomValue.custom_plateau.reflexion.value),
			
			light: ((CustomPlateau && CustomPlateau.light.intensity) ? CustomPlateau.light.intensity : defaultCustomValue.custom_plateau.light.value),
			
			lightEmissive: ((CustomPlateau && CustomPlateau.plateau_data.intensity) ? CustomPlateau.plateau_data.intensity : defaultCustomValue.custom_plateau.lightEmissive.value),
			
			borderColor: ((CustomPlateau && CustomPlateau.wall.color) ? CustomPlateau.wall.color : defaultCustomValue.custom_plateau.borderColor.value),
			borderColorValue: ((CustomPlateau && CustomPlateau.borderColorValue) ? CustomPlateau.borderColorValue : defaultCustomValue.custom_plateau.borderColor.value),

			limiteurColor: ((CustomPlateau && CustomPlateau.boudth.THREEcolor) ? CustomPlateau.boudth.THREEcolor : defaultCustomValue.custom_plateau.limiteurColor.value),
			limiteurColorValue: ((CustomPlateau && CustomPlateau.limiteurColorValue) ? CustomPlateau.limiteurColorValue : defaultCustomValue.custom_plateau.limiteurColor.value),
		}
	} catch (e) {
		console.error(`error in serializeCustomPlateau ${e}`)
	}
}

async function serializeCustomPaddle(CustomPaddle) {
	try {
		return {
			color: ((CustomPaddle && null) ? null : defaultCustomValue.custom_paddle.color.value),
			lightColor: ((CustomPaddle && null) ? null : defaultCustomValue.custom_paddle.lightColor.value),
			light: ((CustomPaddle && null) ? null : defaultCustomValue.custom_paddle.light.value),
			reflexion: ((CustomPaddle && null) ? null : defaultCustomValue.custom_paddle.reflexion.value),
			size: ((CustomPaddle && null) ? null : defaultCustomValue.custom_paddle.size.value),
		}
	} catch (e) {
		console.error(`error in serializeCustomBall ${e}`)
	}
}

async function serializeCustomMap(CustomMap) {
	try {
		return {
			background: ((CustomMap && null) ? null : defaultCustomValue.custom_map.background.value),
		}
	} catch (e) {
		console.error(`error in serializeCustomBall ${e}`)
	}
}

async function serializeCustomScore(CustomScore) {
	try {
		return {
			color: ((CustomScore && null) ? null : defaultCustomValue.custom_score.color.value),
			light: ((CustomScore && null) ? null : defaultCustomValue.custom_score.light.value),
			font: ((CustomScore && null) ? null : defaultCustomValue.custom_score.font.value),
		}
	} catch (e) {
		console.error(`error in serializeCustomBall ${e}`)
	}
}

async function serializeCustomAnimation(CustomAnimation) {
	try {
		return {
			animation: ((CustomAnimation && null) ? null : defaultCustomValue.custom_animation.animation.value),
		}
	} catch (e) {
		console.error(`error in serializeCustomBall ${e}`)
	}
}

export {
	defaultCustomValue,
    serializeCustomGame,
}