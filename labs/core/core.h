#ifndef CG_CORE_H
#define CG_CORE_H
#include <SFML/Graphics/RenderStates.hpp>
#include <SFML/Graphics/RenderTarget.hpp>
#include <SFML/Graphics/RenderWindow.hpp>
#include <SFML/System/Vector2.hpp>
#include <SFML/Window/Event.hpp>
#include <iostream>

namespace core
{

class Locatable
{
public:
	explicit Locatable(sf::Vector2f position)
		: m_position(position) {};

	virtual ~Locatable() = default;

	void SetPosition(sf::Vector2f position)
	{
		m_position = position;
	}

	[[nodiscard]] sf::Vector2f Position() const
	{
		return m_position;
	}

	void Move(sf::Vector2f delta)
	{
		m_position += delta;
	}

private:
	sf::Vector2f m_position;
};

class Kinematic : public Locatable
{
public:
	explicit Kinematic(
		sf::Vector2f position, sf::Vector2f speed, sf::Vector2f acceleration)
		: Locatable(position)
		, m_speed(speed)
		, m_acceleration(acceleration)
	{
	}

	void SetSpeed(sf::Vector2f speed)
	{
		m_speed = speed;
	}

	[[nodiscard]] sf::Vector2f Speed() const
	{
		return m_speed;
	}

	void SetAcceleration(sf::Vector2f acc)
	{
		m_acceleration = acc;
	}

	void IntegrateSpeed(float dt)
	{
		m_speed += m_acceleration * dt;
	}

	void IntegratePosition(float dt)
	{
		Move(m_speed * dt);
	}

private:
	sf::Vector2f m_speed;
	sf::Vector2f m_acceleration;
};

class Drawable
{
public:
	virtual ~Drawable() = default;

	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states) = 0;
};

class AbstractView : Drawable
{
public:
	AbstractView(uint w, uint h, const std::string& title)
		: m_window(sf::VideoMode(w, h), title)
	{
	}

	void Run()
	{
		while (m_window.isOpen())
		{
			float dt = m_clock.restart().asSeconds();
			dt = std::min(dt, 0.033f);

			HandleEvents();
			UpdateObjects(dt);
			Redraw();
		}
	}

private:
	void Redraw()
	{
		m_window.clear(sf::Color::White);
		Draw(m_window, sf::RenderStates::Default);
		m_window.display();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override = 0;

	virtual void UpdateObjects(float dt)
	{

	}

	virtual void HandleEvents()
	{
		sf::Event e{};
		while (m_window.pollEvent(e))
		{
			if (e.type == sf::Event::Closed)
			{
				m_window.close();
			}
		}
	}

	sf::RenderWindow m_window;
	sf::Clock m_clock;
};

class Clickable
{
public:
	virtual ~Clickable() = default;

	virtual void OnMouseDown(sf::Vector2f mousePosition) = 0;

	virtual void OnMouseUp(sf::Vector2f mousePosition) = 0;

	virtual void OnMouseMove(sf::Vector2f mousePosition) = 0;
};
} // namespace core

#endif // CG_CORE_H
